'use strict';

let Crawler = require('./lib/main'),
	config = require('./config'),
	colors = require('colors'),
	path = require('path'),
	urlencode = require('urlencode'),
	args = process.argv,
	cmdList = [
		'list',
		'search',
		'download'
	];

let searchUrl = 'http://www.imooc.com/index/searchcourse?words=';
let chapterUrl = 'http://www.imooc.com/learn/';

if(args.length <=2 ){
	let worker = new Crawler({
	    timeout : config.timeout,
	    videoDir : config.videoDir,
	    target : config.target
	});

	worker.run();
}else{
	let cmds = Array.prototype.slice.apply(args);
	let cmd = cmds[2].replace(/^\-+/g,'');
	if(cmdList.indexOf(cmd) < 0){
		console.log('指令 ' + cmd + ' 不存在');
		console.log('可用的指令有:' + colors.bgGreen(colors.red('[ ' + cmdList.map(e => '--' + e).join(' , ') + ' ]\n')));
	}
	if(cmd == 'search'){
		if(!cmds[3]){
			console.log('缺少关键词参数');
		}else{
			let searchLink = searchUrl + urlencode(cmds[3]);
			console.log(colors.magenta('Searching course list about: " ' + cmds[3] + ' "...'));
			let worker = new Crawler({
			    timeout : config.timeout
			});
			worker.showSearchList(searchLink);
		}
	}else if(cmd == 'list'){
		if(!cmds[3]){
			console.log('缺少课程ID');
		}else{
			let targetId = cmds[3];
			if(+targetId == NaN){
				console.log('课程ID格式有误，应该为数字格式');
			}
			let chapterLink = chapterUrl + cmds[3];
			console.log(colors.magenta('Reading course list from: ' + chapterLink + '...'));
			let worker = new Crawler({
			    timeout : config.timeout
			});
			worker.showItems(chapterLink);

		}
	}else if(cmd == 'download'){
		if(!cmds[3]){
			console.log('缺少课程ID');
		}else{
			let targetId = Array.prototype.slice.call(args,3);
			if(+targetId == NaN){
				console.log('课程ID格式有误，应该为数字格式');
			}
			let worker = new Crawler({
			    timeout : config.timeout,
			    videoDir : config.videoDir,
			    target : targetId
			});

			worker.run();
		}
	}
}
