'use strict';

let htmlLoader = require('../lib/urllib');
let assert = require('chai').assert;

const utf8URL = `http://www.baidu.com`;
const gbkURL = `http://www.qq.com`;

describe('Get html source',function() {
  it('missing target url',function() {
    assert.throws(
      function() {
        htmlLoader();
      }
      , Error
      , '缺少参数url'
    );
  });

  it('param url were wrong type', function() {
    assert.throws(
      function() {
        htmlLoader({});
      }
      , Error
      , '参数url必须为String'
    );
  });

  it('not pass param options',function(done) {
    htmlLoader(utf8URL,function(err,body) {
      if (err) {
        done(err);
      } else {
        done();
      }
    })
  });

  it('pass param options',function(done) {
    htmlLoader(utf8URL,{
      timeout: 5000
    },function(err,body) {
      if (err) {
        done(err);
      } else {
        done();
      }
    })
  });

  it('request timeout',function(done) {
    htmlLoader(utf8URL,{
      timeout: 1
    },function(err,body) {
      if (err) {
        done();
      } else {
        done(Error('not timeout'))
      }
    })
  });

  it('get charset gbk html source',function(done) {
    htmlLoader(gbkURL,{
      timeout: 5000
    },function(err,body) {
      if (err) {
        done(err);
      } else {
        done();
      }
    })
  });
})