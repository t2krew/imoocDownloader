'use strict';

process.on('uncaughtException', (err) => {
    logger.error(err);
});

var logger = require('./lib/logger');
var display = require('./lib/display');
var Imooc = require('./imooc');
var config = require('./conf/config.default');

let cmds = ['search','s','list','l','download','d'];

let args = process.argv.slice(2);

let imooc = new Imooc(config);

if (args.length > 0) {
  let cmd = args[0];
  let param = args[1];
  if (cmds.indexOf(cmd) < 0) {
    console.log(`指令 --${cmd} 不存在`.red);
    console.log(`可用的指令有:`.green,`[ ${ cmds.map(e => '--' + e).join(' , ')} ]`.red);
  }
  if (!param) {
    console.log('缺少参数值'.red);
  }
  if (cmd == 'search' || cmd == 's') {
    imooc.getCourses(param, function(err, data) {
      if (err) {
        logger.error(err);
      } else {
        display.viewCourses(data);
      }
    })
  } else if (cmd == 'list' || cmd == 'l') {
    imooc.getLessons(param, function(err, data) {
      if (err) {
        logger.error(err);
      } else {
        display.viewLessons(data);
      }
    })
  } else if (cmd == 'download' || cmd == 'd') {
    param = param.split(',');
    imooc.setTarget(param);
    imooc.loopCourse();
  }
} else {
  imooc.loopCourse();
}