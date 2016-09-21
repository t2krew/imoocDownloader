'use strict';

let fs = require('fs');
let path = require('path');
let request = require('request');

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

  stream.on('response', function(response) {
    try {
      size = response.headers['content-length'];
    } catch(err) {
      callback(err);
    }
    callback && callback(null, response);
  })

  stream.on('data', function(chunk) {
    chunks += chunk.length;
    callback && callback(null, null, percent(chunks / size));
  })

  stream.on('error', function(err) {
    callback && callback(err);
  })

  stream.on('end', function() {
    callback && callback(null, null, null, true);
  })

  stream.pipe(fs.createWriteStream(path.join(opts.storePath,`${opts.name}.mp4`)));
  
}


function percent(num) {
  num = (num * 100).toString();
  if (num.indexOf('.') > -1) {
    num = Number(num).toFixed(2);
  } 
  return num;
}