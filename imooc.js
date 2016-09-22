'use strict';

let fs = require('fs');
let path = require('path');
let mkdirp = require('mkdirp');
let util = require('./lib/util');
let urllib = require('./lib/urllib');
let display = require('./lib/display');
let conf = require('./conf/config.local');
let htmlParser = require('./lib/htmlParser');
let downloader = require('./lib/downLoader');

const mediainfoURI = `http://www.imooc.com/course/ajaxmediainfo/?mid=`;

/**
 * imoocDownloader constructor
 * @param  {Object} opts 配置
 */
function imoocDownloader(opts) {
  opts = opts || {};
  this.course = {};
  this.start = true;
  this.courseList = {};
  this.targets = opts.targets || [];
  this.videoDir = opts.videoDir;
  let definition;
  //视频清晰度（ 默认为high ）
  switch (opts.definition) {
    case 'low' : definition = 0;
      break;
    case 'mid' : definition = 1;
      break;
    default : definition = 2;
  }
  this.definition = definition;
}

/**
 * 根据关键字获取课程信息
 * @param  {String}   keyword  搜索关键字
 * @param  {Function} callback 回调函数
 */
imoocDownloader.prototype.getCourses = function(keyword, callback) {
  let ctx = this;
  let target = `${conf.URI.SEARCH_COURSE + keyword}`;
  //抓取目标搜索页面dom
  urllib(target, function(err, html) {
    if (err) {
      callback && callback(err, null);
      return;
    }
    //解析dom
    let dom = new htmlParser(html);
    let data = {};
    data['keyword'] = keyword;
    data['title'] = dom.getTitle();
    data['items'] = dom.getCourseList();

    ctx.courseList = data;
    callback && callback(null, data);
  })

}

/**
 * 根据课程id获取课程明细
 * @param  {String}   courseId 课程编号
 * @param  {Function} callback 回调函数
 */
imoocDownloader.prototype.getLessons = function(courseId, callback) {
  let ctx = this;
  let target = `${conf.URI.SEARCH_LESSON + courseId}`;
  //抓取目标课程页面dom
  urllib(target, function(err, html) {
    if (err) {
      callback && callback(err, null);
      return;
    }
    //解析dom
    let dom = new htmlParser(html);
    let data = {};
    let course = dom.getCourseDetail();
    data['id'] = courseId;
    data['title'] = course.title;
    data['items'] = course.items;
    //缓存课程信息
    ctx.course[courseId] = data;
    callback && callback(null, data);
  })
}

/**
 * 遍历待下载课程
 */
imoocDownloader.prototype.loopCourse = function(callback) {
  let ctx = this;
  //判断是否是首次执行
  if (this.start) {
    this.start  = false;
    //获取首次执行时间点
    this.startTime = Date.now();
  }
  //判断是否还有未下载目标
  if (this.targets.length > 0) {
    //初始化当前课程标题
    this.courseTitle = null;
    //如果有未下载课程
    //则按顺序从头到尾获取课程
    let target = this.targets.shift();
    //获取课程章节
    this.getLessons(target, function(err, data) {
      if (err) {
        callback && callback(err);
      } else {
        //缓存课程标题
        ctx.courseTitle = data.title;
        let dest = path.join(ctx.videoDir, ctx.courseTitle);
        //创建课程文件夹
        mkdirp.sync(dest);
        display.downLoadDetail(data);
        //生成课程目录文本
        util.genCourseContents(dest, data);
        ctx.loopChapter(target, loopChapterCb(callback));
      }
    })
  } else {
    //如果目标已完成
    //屏幕打印总耗时
    display.finish({
      time : Date.now() - ctx.startTime
    });
    //退出进程
    process.exit(0);
  }
}

/**
 * 遍历待下载章节
 * @param  {String}   courseId 课程编号
 * @param  {Function} callback 回调函数
 */
imoocDownloader.prototype.loopChapter = function(courseId, callback) {
  let ctx = this;
  //获取待下载课程明细
  let items = this.course[courseId]['items'];
  //判断是否还有未下载章节
  if (items.length > 0) {
    //如果有未下载章节
    //则按顺序从头到尾获取章节信息
    let item = items.shift();
    //判断该节点类型
    if (item.type === 'chapter') {
      //如果为chapter则创建目录
      mkdirp(path.join(ctx.videoDir, ctx.courseTitle, item.title),function(err) {
        if (err) {
          callback && callback(err);
        } else {
          //缓存当前目录地址
          ctx.currentChapterDir = path.join(ctx.videoDir, ctx.courseTitle, item.title);
          ctx.loopChapter(courseId, callback);
        }
      });
    } else if (item.type === 'lesson') {
      //如果类型为lesson则下载
      this.download(item, function(err, end) {
        if (err) {
          callback && callback(err);
        } 
        if (end) {
          //下载完成， 重新遍历未下载章节
          ctx.loopChapter(courseId, callback);
        }
      })
    }
  } else {
    //如果该课程已无待下载章节
    //便遍历未下载课程
    display.br();
    this.loopCourse(callback);
  }
}

/**
 * 下载章节视频
 * @param  {Object}   item     章节信息
 * @param  {Function} callback  回调函数
 */
imoocDownloader.prototype.download = function(item, callback) {
  let ctx = this;
  //获取lesson视频文件地址
  this.getVideoURI(item.id, function(err, url) {
    if (err) {
      callback && callback(err);
    } else {
      //下载文件
      downloader({
        url : url,
        name : item.title,
        storePath : ctx.currentChapterDir
      }, function(err, response, progress, end) {
        if (err) {
          callback && callback(err);
        } else if (response) {
          console.log(`\n正在下载${item.title}`.red);
        } else if (progress) {
          //屏幕显示下载进度
          display.download(progress);
        } else if (end) {
          callback && callback(null, true);
        }
      })
    }
  })
}

/**
 * 获取视频下载地址
 * @param  {String}   lessonId  章节id
 * @param  {Function} callback 回调函数
 */
imoocDownloader.prototype.getVideoURI = function(lessonId, callback) {
  let ctx = this;
  let courseURI = mediainfoURI + lessonId;
  urllib(courseURI, {json : true}, function(err, result) {
    if (err) {
      callback && callback(err);
    } else {
      try {
        if (result.result === 0) {
          let mpath = result.data.result.mpath;
          callback && callback(null, mpath[ctx.definition]);
        } else {
          callback && callback(new Error(result.msg || '节不存在或被删除'));
        }
      } catch(err) {
        callback && callback(err);
      }
    }
  })
}

/**
 * 设置下载目标
 * @param {Array} targets 下载目标集合
 */
imoocDownloader.prototype.setTarget = function(targets){
  this.targets = targets;
}

/**
 * 遍历章节回调函数
 * @param  {Function} cb 回调函数
 * @return {Function}      
 */
function loopChapterCb(cb) {
  return function(err) {
    if (err) {
      cb && cb(err);
    }
  }
}


exports = module.exports = imoocDownloader;