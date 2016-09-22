'use strict';

let fs = require('fs');
let path = require('path');


exports.trim = function(str) {
  return str.replace(/(^\s*|\s*$)/g,'');
}

/*
 * 初始化日志目录
 * @param {Array} 日志文件配置
 * @Return {Array} 日志文件配置
 */
exports.initLogDir = function (configure) {
  return configure.map (function(e) {
    let filename = e.filename;
    try {
      fs.statSync(filename);
    } catch (err) {
      if (err.code === 'ENOENT') {
        let p = process.cwd(), 
            pa = filename.split('/');
        for (let i = 0; i < pa.length - 1; i++) {
          p = path.join(p,pa[i]);
          try {
            fs.readdirSync(p);
          } catch (err) {
            if (err.code === 'ENOENT') {
              fs.mkdirSync(p);
            } else {
              throw err;
            }
          }
        }
      } else {
        throw err;
      }
    }
    return e;
  })
}

/**
 * 生成课程目录文本
 * @param  {String} dest 存储路径
 * @param  {Object} data 课程数据
 */
exports.genCourseContents = function(dest, data) {
  dest = path.join(dest, '目录.txt');
  try {
    fs.unlinkSync(dest);
  } catch (err) {}
  data.items.forEach(function(item) {
    if (item.type === 'chapter') {
      fs.appendFileSync(dest, `+ -- ${item.title}\n`);
    } else if (item.type === 'lesson') {
      fs.appendFileSync(dest, `+ --- ${item.title}\n`);
    }
  })
}