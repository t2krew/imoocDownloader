'use strict';

let utils = require('./lib/utils');
let config = require('./config');


let Crawler = require('./lib/main');

let worker = new Crawler({
    timeout : 4,
	videoDir : './video',
    target : [552,556,21,441,11]
});


worker.run();
