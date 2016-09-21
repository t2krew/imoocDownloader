'use strict';

let request = require('request');
let iconv = require('iconv-lite');

/**
 * HtmlLoader
 * @param {String} url 目标地址
 * @param {Object} options 配置
 * @param {Function} callback 回调函数
 */
function HtmlLoader(url, options, callback) {
  if (!url) {
    throw new Error('缺少参数url');
  }
  if (Object.prototype.toString.call(url) !== '[object String]') {
    throw new Error('参数url必须为String');
  }

  if (Object.prototype.toString.call(options) === '[object Function]') {
    callback = options;
    options = {};
  }

  // 获取页面数据流
  let stream = request.get({
    url: url,
    headers: {'User-Agent': `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6 AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36`},
    timeout: options.timeout || 10000
  });

  stream.on('error', function(err) {
    callback(err, null);
  });

  let size = 0;
  let result = '';
  let chunks = [];

  stream.on('response', function(res) {
    let htmlRegExp = /(c|C)ontent\s*=\s*"\s*(?:text\/html;\s*)?((c|C)harset\s*=\s*(gbk|GB\d{1,4}))\s*"/i;
    let headerRegExp = /(gbk|GB\d{1,4})/i;

    let contentType = res.headers['content-type'];

    // 接收数据块
    res.on('data', function(chunk) {
      chunks.push(chunk);
      size += chunk.length;
    });

    res.on('error', function(err) {
      callback(err, null);
    });

    res.on('end', function() {
      let position = 0;
      let buffer = new Buffer(size);

      // 拼接数据块
      chunks.map(function(e) {
        e.copy(buffer, position);
        position += e.length;
        return e;
      });

      // 将buffer转换为utf8编码
      result = buffer.toString('utf8');
      // 判断网页字符编码是否为gbk
      if (headerRegExp.test(contentType) || htmlRegExp.test(result)) {
        // 转换gbk编码为utf8
        result = iconv.decode(buffer, 'gbk');
      }
      if (options.json) {
        result = JSON.parse(result);
      }
      callback(null, result);
    });
  });
}

exports = module.exports = HtmlLoader;
