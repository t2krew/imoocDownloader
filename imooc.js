'use strict';

let fs = require('fs');
let path = require('path');
let mkdirp = require('mkdirp');
let conf = require('./conf/config.local');
let urllib = require('./lib/urllib');
let htmlParser = require('./lib/htmlParser');
let downloader = require('./lib/downLoader');
let display = require('./lib/display');

const mediainfoURI = `http://www.imooc.com/course/ajaxmediainfo/?mid=`;

function imoocDownloader(opts) {
  opts = opts || {};
  this.course = {};
  this.start = true;
  this.courseList = {};
  this.targets = opts.targets || [];
  this.videoDir = opts.videoDir;
  
  let definition;
  switch (opts.definition) {
    case 'low' : definition = 0;
      break;
    case 'mid' : definition = 1;
      break;
    default : definition = 2;
  }
  this.definition = definition;
}

imoocDownloader.prototype.getCourses = function(keyword, callback) {
  let ctx = this;
  let target = `${conf.URI.SEARCH_COURSE + keyword}`;
  urllib(target, function(err, html) {
    if (err) {
      callback && callback(err, null);
      return;
    }
    let dom = new htmlParser(html);
    let data = {};
    data['keyword'] = keyword;
    data['title'] = dom.getTitle();
    data['items'] = dom.getCourseList();

    ctx.courseList = data;
    callback && callback(null, data);
  })

}

imoocDownloader.prototype.getLessons = function(courseId, callback) {
  let ctx = this;
  let target = `${conf.URI.SEARCH_LESSON + courseId}`;
  urllib(target, function(err, html) {
    if (err) {
      callback && callback(err, null);
      return;
    }
    let dom = new htmlParser(html);
    let data = {};
    let course = dom.getCourseDetail();
    data['id'] = courseId;
    data['title'] = course.title;
    data['items'] = course.items;
    ctx.course[courseId] = data;
    callback && callback(null, data);
  })
}

imoocDownloader.prototype.loopCourse = function(callback) {
  let ctx = this;
  if (this.start) {
    this.start  = false;
    this.startTime = Date.now();
  }
  if (this.targets.length > 0) {
    this.courseTitle = null;
    let target = this.targets.shift();
    this.getLessons(target, function(err, data) {
      if (err) {
        callback && callback(err);
      } else {
        display.downLoadDetail(data);
        ctx.loopChapter(target, loopChapterCb(callback));
      }
    })
  } else {
    display.finish({
      time : Date.now() - ctx.startTime
    });
    process.exit(0);
  }
}

imoocDownloader.prototype.loopChapter = function(courseId, callback) {
  let ctx = this;
  let items = this.course[courseId]['items'];
  if (!this.courseTitle) {
    this.courseTitle = this.course[courseId]['title'];
  }
  if (items.length > 0) {
    let item = items.shift();
    if (item.type === 'chapter') {
      mkdirp(path.join(ctx.videoDir, ctx.courseTitle, item.title),function(err) {
        if (err) {
          callback && callback(err);
        } else {
          ctx.currentChapterDir = path.join(ctx.videoDir, ctx.courseTitle, item.title);
          ctx.loopChapter(courseId, callback);
        }
      });
    } else if (item.type === 'lesson') {
      this.download(item, function(err, end) {
        if (err) {
          callback && callback(err);
        } 
        if (end) {
          ctx.loopChapter(courseId, callback);
        }
      })
    }
  } else {
    display.br();
    this.loopCourse();
  }
}

imoocDownloader.prototype.download = function(item, callback) {
  let ctx = this;
  this.getVideoURI(item.id, function(err, url) {
    if (err) {
      callback && callback(err);
    } else {

      downloader({
        url : url,
        name : item.title,
        storePath : ctx.currentChapterDir
      }, function(err, response, progress, end) {
        if (err) {
          callback && callback(err);
        } else if (response) {
          console.log(`正在下载${item.title}`.red);
        } else if (progress) {
          display.download(progress);
        } else if (end) {
          callback && callback(null, true);
        }
      })
    }
  })
}

imoocDownloader.prototype.getVideoURI = function(courseId, callback) {
  let ctx = this;
  let courseURI = mediainfoURI + courseId;
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

imoocDownloader.prototype.setTarget = function(targets){
  this.targets = targets;
}

function loopChapterCb(cb) {
  return function(err) {
    if (err) {
      cb && cb(err);
    }
  }
}


exports = module.exports = imoocDownloader;