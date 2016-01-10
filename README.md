# imoocDownloader

###Introduction

imoocDownloader 用来爬取慕课网上指定课程id视频


###Installation

```shell
git clone https://github.com/webbought/imoocDownloader.git

cd imoocDownloader 

npm install
```

###example
```javascript
'use strict';

let Crawler = require('./lib/main');

let worker = new Crawler({
    timeout : 4,          //second
	videoDir : './video',
    target : [552,556,21,441,11]  
});


worker.run();
```
