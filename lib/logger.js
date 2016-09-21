'use strict';

let log4js = require('log4js');
let Writeable = require('stream').Writable;
let util = require('./util');

//配置log4js
log4js.configure({
  appenders: util.initLogDir([
    { type: 'file', filename: 'log/request.log', category: 'request' },
    { type: 'file', filename: 'log/error.log', category: 'SystemError' },
  ])
});

let netRequest = log4js.getLogger('request');
let SystemError = log4js.getLogger('SystemError');

/*
 * 网络请求
 */
exports.request = new Writeable({
  write: function(chunk, encoding, next) {
    netRequest.info.call(netRequest,chunk.toString('utf8'));
    next();
  }
});;

/*
 * 系统异常
 * @param {String} 异常信息
 */
exports.error = function(message){
  SystemError.error.call(SystemError,message);
};
