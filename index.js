'use strict';

process.on('uncaughtException', (err) => {
    console.error(err);
});

var Imooc = require('./imooc');
var program = require('commander');
var logger = require('./lib/logger');
var display = require('./lib/display');
var config = require('./conf/config.default');

let imooc = new Imooc(config);

program
  .version('1.1.0')
  .option('-s, --search <n>', 'Search course specified by keywords', search)
  .option('-l, --list <n>', 'Show the Chapters and Lessons by course Id', list)
  .option('-d, --download <n>', 'Download the Course By course Id', download)
  .parse(process.argv);

if (!program.search &&
    !program.list &&
    !program.download) {
      imooc.loopCourse(fail);
    }

function search(keyword) {
  imooc.getCourses(keyword, function(err, courses) {
    if (err) {
      logger.error(err);
    } else {
      display.viewCourses(courses);
    }
  })
}


function list(courseName) {
  imooc.getLessons(courseName, function(err, lessons) {
    if (err) {
      logger.error(err);
    } else {
      display.viewLessons(lessons);
    }
  })
}


function download(ids) {
  ids = ids.split(',');
  imooc.setTarget(ids);
  imooc.loopCourse(fail);
}


function fail(err) {
  if (err) logger.error(err);
}