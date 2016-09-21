'use strict';

let util = require('./util');
let cheerio = require('cheerio');
let config = require('../conf/config.local');

/**
 * [HtmlParser description]
 * @param {[type]} html [description]
 */
function HtmlParser(html) {
  this.$ = cheerio.load(html);
  this._ = this.dom = this.$('html');
}

HtmlParser.prototype.getTitle = function() {
  let dom = this.dom;
  return util.trim(dom.find('title').text());
}

HtmlParser.prototype.getCourseList = function() {
  let $ = this.$;
  let _ = this._;
  let lists = [];
  let items = _.find('.course-item');

  items.each(function(index, ele) {
    let item = {};
    try {
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


HtmlParser.prototype.getCourseDetail = function() {
  let $ = this.$;
  let _ = this._;

  let course = {};
  course['title'] = util.trim(_.find('.course-infos h2').text());
  course['items'] = [];

  let chapters = _.find('.chapter');

  chapters.each(function(index, ele) {
    let chapter = {};
    let h3 = $(ele).find('h3 strong').text().replace(/\s/g, '');
    let info = $(ele).find('h3 strong .chapter-info').text().replace(/\s/g, '');
    let lessons = $(ele).find('ul.video li');

    chapter['type'] = 'chapter';
    chapter['title'] = h3.replace(info, '');

    course['items'].push(chapter);

    lessons.each(function(index, lessonEle) {
      let lesson = {};
      let href = $(lessonEle).find('a').attr('href');

      try {
        var id = href.match(/\/(\d+)$/)[1];
      } catch(err) {
        throw err;
      }

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
