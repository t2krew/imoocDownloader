'use strict';

let fs = require('fs');
let path = require('path');
let request = require('request');

/**
 * 文件下载
 * @param  {Object}   opts     文件信息
 * @param  {Function} callback 回调函数
 */
module.exports = function(opts, callback){
  let size,
      chunks = 0;

  if (!opts.url) {
    return callback(new Error('缺少目标url'));
  }
  if (!opts.storePath) {
    return callback(new Error('缺少视频保存路径'));
  }

  let stream = request.get(opts.url);
  //响应数据
  stream.on('response', function(response) {
    try {
      //获取文件大小
      size = response.headers['content-length'];
    } catch(err) {
      callback(err);
    }
    callback && callback(null, response);
  })

  stream.on('data', function(chunk) {
    //已下载大小
    chunks += chunk.length;
    callback && callback(null, null, percent(chunks / size));
  })

  stream.on('error', function(err) {
    callback && callback(err);
  })

  stream.on('end', function() {
    callback && callback(null, null, null, true);
  })

  //通过管道传输文件
  stream.pipe(fs.createWriteStream(path.join(opts.storePath,`${opts.name}.mp4`)));
  
}

/**
 * 计算百分比
 * @param  {Number} num 下载进度比值
 * @return {Number}     下载进度百分比
 */
function percent(num) {
  num = (num * 100).toString();
  if (num.indexOf('.') > -1) {
    num = Number(num).toFixed(2);
  } 
  return num;
}