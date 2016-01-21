# imoocDownloader

###简介

imoocDownloader 用来爬取慕课网上指定课程id视频


###安装

```shell
git clone https://github.com/webbought/imoocDownloader.git

cd imoocDownloader 

npm install
```



###Usage
```javascript
'use strict'

module.exports = {
    rootDir : __dirname,
    timeout : 10,
    videoDir : './video',
    target : [552,556,21,441,11]
}
```

#####配置好config文件，执行 `node index.js`即可。 
 
###命令行用法
```shell
node index.js <command> <arguments>
```

*    command
    *    --search 查找 后面必须有所要查找的关键词参数
        *    arguments {String} search word
    *    --list 课程列表  后面必须有所要查看的课程ID
        *    arguments {Number} course id
    *    --download 下载  后面必须有所要下载的课程ID
        *    arguments {Number} course id
    
####example
```shell
node index.js --search mongodb
```
![search][1]

```shell
node index.js --list 434
```
![list][2]

```shell
node index.js --download 434
```
![download][3]


[1]: https://github.com/webbought/imoocDownloader/blob/master/img/1.png "search"
[2]: https://github.com/webbought/imoocDownloader/blob/master/img/2.png "list"
[3]: https://github.com/webbought/imoocDownloader/blob/master/img/3.png "download"
