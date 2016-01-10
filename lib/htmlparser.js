'use strict';

let cheerio = require('cheerio').load;
let utils = require('./utils');



/*
 * Parser构造函数
 * @param html {string} 待解析html字符串
 */
function Parser(html){
    this.title = '';
    this.summy = '';
    this.chapters = [];
    this.init(html);
}

/*
 * 初始化方法
 * @param  h {string } 待解析html字符串
 */
Parser.prototype.init = function(h){
    this.$ = cheerio(h);
    this.title = utils.trim(this.$('title').text());
}


/*
 * 提取页面指定视频链接
 *
 */
Parser.prototype.getLink = function(){
    let self = this;
    self.$('.chapter').each(function(e,i){
        self.chapters.push();
        let temp = {};
        temp['chapterName'] = utils.trim(self.$(i).find('h3 strong').text());
        temp['item'] = [];
        self.$(this).find('.video li a').each(function(e,ii){
            let linkTemp = {};
            linkTemp['name'] = utils.trim(self.$(this).text());
            linkTemp['url'] = self.$(this).attr('href');
            temp['item'].push(linkTemp);
        })
        self.chapters.push(temp);
    })
    return self.chapters;
}


module.exports = Parser;