'use strict';

let log4js = require('log4js');
let Writeable = require('stream').Writable;
let util = require('./util');

//配置log4js
log4js.configure({
  appenders: util.initLogDir([
    { type: 'file', filename: 'log/error.log', category: 'error' },
  ])
});

let errorLogger = log4js.getLogger('error');

/*
 * 异常
 * @param {Error} error
 */
exports.error = function(err){
  errorLogger.error.call(errorLogger,err);
};
