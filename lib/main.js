'use strict';

let fs = require('fs');
let util = require('util');
let colors = require('colors');
let utils = require('./utils');
let request = require('request');
let Htmlparser = require('./htmlparser');
let EventEmitter = require('events').EventEmitter;


/**
 * Crawler构造函数
 */

function Crawler(opts) {
    if (!(this instanceof Crawler)) {
        return new Crawler;
    }
    this.init(opts);
}

/*
 * 初始化
 *
 */
Crawler.prototype.init = function(opts){
    this.tasks = [];
    this.repeat = 1;
    this.once = false;
    this.lessonPath = '';
    this.chapterPath = '';
    this.videoDir = opts.videoDir;
    this.timeout = (opts.timeout * 1000)|| 10000;
    this.limit = opts.limit || 3;
    this.target = opts.target;
    this.baseUrl = 'http://www.imooc.com/learn/';
    this.baseVideoUrl = 'http://www.imooc.com/course/ajaxmediainfo/?mid=';
}


/*
 * 启动 
 * @param {object} 
 */
Crawler.prototype.run = function(opts){
    if(opts && typeof opts == 'object'){
        if(opts.single){
            this.singleTask();
        }else if(opts.multi){
            this.multiTasks();
        }
    }else{
        this.singleTask();
    }
}

/*
 * 单任务模式
 *
 */
Crawler.prototype.singleTask = function(){
    //如果目标为字符串，将其补齐后转换为数组类型
    if(typeof this.target == 'string'){
        this.tasks = [this.baseUrl + this.target];
    }else{
        //对数组的每项补齐成为完整的链接
        this.target.map( e => this.tasks.push(this.baseUrl + e));
    }
    this.loopLesson();
}


/*
 * 多任务模式
 *
 */
Crawler.prototype.multiTasks = function(){

}


/*
 * 依次提取待下载课程
 *
 */
Crawler.prototype.loopLesson = function(){
    //重置重复请求次数
    this.repeat = 1;
    let self = this;
    //判断课程目标中是否还有待下载课程，否则退出程序
    if(this.tasks.length > 0){
        //提取队列中第一个目标(先进先出)
        let currLesson = this.tasks.shift();
        if(this.once){
            console.log('\n');
        }
        this.once = true;
        //获取课程页面
        this.getHtml(currLesson);
    }else{
        console.log(' >>> done <<< ');
        process.exit(0);
    }
}


/*
 * 获取目标页面
 * @param url {string} 目标页面链接
 */
Crawler.prototype.getHtml = function(url){
    let self = this;
    //判断重试次数是否大于限制次数
    if(this.repeat <= this.limit){
        console.log('正在请求: ',colors.bgGreen(' ',colors.red(url.slice(url.lastIndexOf('/') + 1)),' '));
        request.get(url,{timeout:self.timeout},function(err,response,body){
            if(err && err.code == 'ETIMEDOUT'){
                console.log('请求超时，正在进行第 ' + self.repeat + ' 次重新请求');
                self.repeat ++;
                //超时重新请求
                self.getHtml(url);
            }else{
                //解析html
                let p = new Htmlparser(body);
                //配置该课程本地目录路径
                self.lessonPath = self.videoDir + '/' + noneDiagonal(p.title);
                //检查课程路径是否存在，否则创建新目录
                utils.checkFolder(self.lessonPath);
                //提取该页面课程链接
                let v = p.getLink();
                console.log(colors.green('>>>'));
                console.log(colors.green('+ -正在下载课程《' + p.title.substring(0,25) + '》...'));
                for(let i=0;i<v.length;i++){
                    console.log(colors.green('+ --' + v[i]['chapterName']));
                    for(let j=0;j<v[i]['item'].length;j++){
                        console.log(colors.green('+ ---' + v[i]['item'][j]['name']));
                    }
                }
                console.log(colors.green('<<<'));
                //遍历章节
                self.loopChapter(v);
            }
        })
    }else{
        //重新`获取课程`
        this.loopLesson();
    }
}


/*
 * 遍历章节
 * @param chapters {array} 待下载章节
 */

Crawler.prototype.loopChapter = function(chapters){
    //判断是否还有待下载章节，否则重新`获取课程`
    if(chapters.length > 0){
        //提取待下载章节
        let currChapter = chapters.shift();
        //配置 章节本地目录路径
        this.chapterPath = this.lessonPath + '/' + noneDiagonal(currChapter['chapterName']);
        //检查本地是否已存在该目录，否则创建
        utils.checkFolder(this.chapterPath);
        //获取章节中小节信息
        let item = currChapter.item;
        //遍历小节
        this.loopItem(item,chapters)
    }else{
        //重新`获取课程`
        this.loopLesson();
    }
}


/*
 * 遍历小节
 * @param items {array} 待下载小节
 * @param chapters {array} 待下载章节
 * @param d {boolean} 文件出错重新下载时是否提示(可选)
 *
 */
Crawler.prototype.loopItem = function(items,chapters){
    //判断是否还有待下载小节，否则重新 `获取章节`
    if(items.length > 0){
        //提取待下载小节
        let  currItem = items.shift();
        //下载
        this.stream(currItem,items,chapters);
    }else{
        //重新`获取章节`
        this.loopChapter(chapters);
    }
}


/*
 * 提取视频下载链接
 * @param url {string} 待提取链接
 * return {Promise}
 */
Crawler.prototype.getVideoUrl = function(url){
    let self = this;
    //匹配视频链接正则 { /video/726 }
    let reg = /\/video\/(\d+)/;
    let p = new Promise(function(resolve,reject){
        //判断是否是视频链接,否则返回错误状态
        if(reg.test(url)){
            url = self.baseVideoUrl + url.match(reg)[1];
            request.get(url,{timeout:self.timeout},function(err,response,body){
                if(err && err.code == 'ETIMEDOUT'){
                    //超时则重新请求
                    self.getVideoUrl(url);
                }else if(err){
                    console.log(err)
                    reject(err);
                }else if(response.statusCode == 200){
                    let data = JSON.parse(body);
                    //返回成功状态并传递 视频url
                    resolve(data['data']['result']['mpath'][0])
                }
            })
        }else{
            reject(new Error('no video'));
        }
    });
    //返回promise
    return p;
}


/*
 * 下载小节视频
 * @param item {object} 当前下载小节对象
 * @param items {array} 待下载小节
 * @param chapters {array} 待下载章节
 * @param d {boolean} 文件出错重新下载时是否提示(可选)
 */
Crawler.prototype.stream = function(item,items,chapters){
    let self = this;
    //文件大小
    let fileSize = 0;
    //已下载文件大小
    let passedLength = 0;
    //开始下载时间
    let start = null;
    //耗时
    let spend = null;
    //待下载视频本地路径
    let itemPath = utils.checkFolder(self.chapterPath) + '/' + item.name + '.mp4';
    //定义文件流
    let stream = null;
    //提取视频下载链接后请求文件流
    this.getVideoUrl(item.url).then(function(value){
        stream = request.get(value)
        .on('response',function(response){
            console.log('正在下载 '+ item.name);
            //获取文件大小
            fileSize = Number(response.headers['content-length']);
            //配置开始请求时间
            start = new Date().getTime();
            //检查文件是否存在
            let stats = utils.checkFileSync(itemPath);
            //文件存在则判断文件信息，否则直接读写文件流
            if(stats){
                //判断文件大小
                if(stats['size'] < fileSize){
                    //如果文件大小小于比实际大小，则删除后重新下载
                    fs.unlink(itemPath);
                    console.log(colors.red('文件已存在，未完成将删除后重新下载...'));
                    //补回待下载小节后重新下载
                    items.unshift(item);
                    return self.loopItem(items,chapters);
                }else{
                    console.log(colors.red.underline('文件已存在，将下载下一个文件...'))
                    return self.loopItem(items,chapters);
                }
            }else{
                stream
                .on('data',function(chunk){
                    //记录已读取文件大小
                    passedLength += chunk.length;
                    var arrow = '';
                    //计算百分比
                    var percent = parseInt((passedLength/fileSize)*100);
                    for(var i=0;i<percent/2;i++){
                        arrow += '-'
                    }
                    arrow += '>'
                    process.stdout.clearLine();
                    process.stdout.cursorTo(0);
                    process.stdout.write((passedLength/1000000).toFixed(1) + 'MB ' + arrow +'  '+ percent +'%');
                })
                .on('error',function(err){
                    console.log(colors.red('下载文件出错...'));
                    return self.loopItem(items,chapters);
                })
                .on('end',function(){
                    return self.loopItem(items,chapters);
                })
                //文件流写到本地
                .pipe(fs.createWriteStream(itemPath));
            }
        })

    },function(err){
        console.log(err);
        self.loopItem(items,chapters);
    })
}



function noneDiagonal(str){
    return str.replace(/\//g,'&');
}


module.exports = Crawler;
