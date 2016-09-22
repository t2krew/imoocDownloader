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
 * 异常
 * @param {Error} error
 */
exports.error = function(err){
  SystemError.error.call(SystemError,err);
};
