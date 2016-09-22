'use strict';

let util = require('./util');
let cheerio = require('cheerio');
let config = require('../conf/config.local');

/**
 * HtmlParser constructor
 * @param {String} html 页面html字符串
 */
function HtmlParser(html) {
  this.$ = cheerio.load(html);
  this._ = this.dom = this.$('html');
}

/**
 * 获取页面标题
 * @return {String} 页面标题
 */
HtmlParser.prototype.getTitle = function() {
  let dom = this.dom;
  return util.trim(dom.find('title').text());
}

/**
 * 获取课程列表
 * @return {Array} 课程列表数据
 */
HtmlParser.prototype.getCourseList = function() {
  let $ = this.$;
  let _ = this._;
  let lists = [];
  let items = _.find('.course-item');

  items.each(function(index, ele) {
    let item = {};
    try {
      //匹配课程id
      var id = $(ele).find('.course-item-right a').attr('href').match(/\/(\d+)$/)[1];
    } catch(err) {
      throw err;
    }
    item['id'] = id;
    item['title'] = util.trim($(ele).find('.course-item-right a').text());
    item['description'] = $(ele).find('.course-item-right .content').text().replace(/\s/g,'');
    item['url'] = `${config.URI.COURSE_VIEW + id}`;
    item['image'] = $(ele).find('.course-item-left img').attr('src');
    lists.push(item);
  });
  return lists;
}

/**
 * 获取课程章节列表
 * @return {Object} 课程章节数据
 */
HtmlParser.prototype.getCourseDetail = function() {
  let $ = this.$;
  let _ = this._;

  let course = {};
  course['title'] = util.trim(_.find('.course-infos h2').text());
  course['items'] = [];

  let chapters = _.find('.chapter');
  //遍历chapter
  chapters.each(function(index, ele) {
    let chapter = {};
    let h3 = $(ele).find('h3 strong').text().replace(/\s/g, '');
    let info = $(ele).find('h3 strong .chapter-info').text().replace(/\s/g, '');
    let lessons = $(ele).find('ul.video li');

    chapter['type'] = 'chapter';
    chapter['title'] = h3.replace(info, '');

    course['items'].push(chapter);
    //遍历lesson
    lessons.each(function(index, lessonEle) {
      let lesson = {};
      let href = $(lessonEle).find('a').attr('href');

      try {
        var id = href.match(/\/(\d+)$/)[1];
      } catch(err) {
        throw err;
      }
      //只保留视频章节（过滤掉code）
      if (/^\/video/i.test(href)) {
        lesson['id'] = id;
        lesson['type'] = 'lesson';
        lesson['title'] = $(lessonEle).find('a').text().replace(/(\s|开始学习)/g, '');
        
        course['items'].push(lesson);
      }
    })
  })
  return course;
}



module.exports = HtmlParser;
