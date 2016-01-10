'use strict'

let fs = require('fs'),
	os = require('os'),
	path = require('path'),
    debug = require('debug'),
	config = require('../config');
    
let type = os.type();

/*
 * @检查文件夹是否存在
 * @params 文件夹路径{String} 
 * @支持绝对路径/相对路径
 */
exports.checkFolder = function(p,fn){
    let pa = null,
        ps = '';
        
	if(!path.isAbsolute(p)){
		p = path.resolve(config.rootDir,p);
	}
	if(type == 'Windows_NT'){
        pa = p.split('\\').slice(1);
    }else{
        pa = p.split('/').slice(1);
    }
    for(let i=0;i<pa.length;i++){
        ps += '/';
        ps += pa[i];
        if(!fs.existsSync(ps)){
            fs.mkdirSync(ps);
        } 
    }
    fn && fn();
}


/*
 * 同步检查文件
 * @param {String} 文件路径
 *
 */
exports.checkFileSync = function(p){
    let f = fs.existsSync(p);
    if(!f){
        return null;
    }else{
        return fs.statSync(p);
    }
}


/*
 * 异步检查文件
 * @param {String} 文件路径
 *
 */
exports.checkFileAsync = function(p){
    let promise = new Promise(function(resolve,reject){
        fs.exists(p,function(exist){
            if(!exist){
                resolve(null);
            }else{
                fs.stat(p,function(err,stats){
                    if(!err){
                        resolve(stats);
                    }
                })
            }
        })
    })
    return promise;
}


/*
 * 去除字符串头尾空格 
 * @param str {string} 待处理字符串
 */
exports.trim = function(str){
    return str.replace(/(^\s*)?(\s*$)?/g,'');
}