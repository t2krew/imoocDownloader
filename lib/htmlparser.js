'use strict';

let cheerio = require('cheerio').load;
let utils = require('./utils');
let colors = require('colors');



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
 * @return {Array}
 */
Parser.prototype.getLink = function(){
    let self = this;
    self.$('.chapter').each(function(e,i){
        let temp = {};
        let _this = self.$(i).find('h3 strong');
        _this.find('div').remove();
        temp['chapterName'] = utils.trim(_this.text());
        temp['item'] = [];
        self.$(this).find('.video li a').each(function(e,ii){
            let linkTemp = {};
            let that = self.$(this);
            that.find('button').remove()
            linkTemp['name'] = utils.trim(that.text().replace(/\s{2}/g,""));
            linkTemp['url'] = self.$(this).attr('href');
            temp['item'].push(linkTemp);
        })
        self.chapters.push(temp);
    })
    return self.chapters;
}

/*
 * 获取查找结果
 * @return {Array}
 */
Parser.prototype.getInfo = function(){
    let self = this;
    let course = [];
    self.$('.course-item-right').each(function(e,i){
        let temp = {};
        temp['title'] = self.$(this).find('.course-item-title a').text();
        temp['description'] = self.$(this).find('.content').text().replace(/\s/g,'').substring(0,50) + '...';
        temp['url'] = 'http://www.imooc.com'+self.$(this).find('.course-item-title a').attr('href');
        temp['id'] = self.$(this).find('.course-item-title a').attr('href').match(/\/view\/(\d+)/)[1];
        course.push(temp);
    })
    return course;
}


module.exports = Parser;