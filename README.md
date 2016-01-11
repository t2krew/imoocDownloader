# imoocDownloader

###简介

imoocDownloader 用来爬取慕课网上指定课程id视频


###安装

```shell
git clone https://github.com/webbought/imoocDownloader.git

cd imoocDownloader 

npm install
```

###例子
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

### 用法
####Class: Crawler

#####new Crawler(object)

*    object 配置信息

    *    timeout    超时时间 (分钟)
    *    videoDir   视频下载目录 (支持绝对路径、相对路径)
    *    target     慕课网课程id数组（支持单个id字符串格式）
