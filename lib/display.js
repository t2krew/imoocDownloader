'use strict';

let colors = require('colors');
let config = require('../conf/config.local');

//当前终端窗口宽度
const WIDTH = process.stdout.columns;

/**
 * 打印课程列表
 * @param  {Object} source 课程列表数据
 */
exports.viewCourses = function(source) {
  console.log(colors.magenta(`Searching course list about : ${source.keyword}`));
  source.items.forEach(function(ele, index) {
    fullScreen('-');
    for(let prop in ele) {
      if (prop === 'id') {
        //id背景加红
        console.log(colors.green(`${prop}: `),colors.bgRed(` ${ele[prop]} `));
      } else {
        console.log(colors.green(`${prop}: `),
                    colors.grey(`${ele[prop].substring(0,70)}${prop === 'description' ? '...' : ''}`));
      }
    }
  })

}

/**
 * 打印章节列表
 * @param  {Object} source 章节数据
 */
exports.viewLessons = function(source) {
  console.log(colors.magenta(`Reading lessons from : ${config.URI.SEARCH_LESSON + source.id}`));
  source.items.forEach(function(ele){
    //只打印类型为lesson
    if (ele.type === 'lesson') {
      fullScreen('-');
      for(let prop in ele) {
        if (prop === 'id') {
          //id背景加红
          console.log(colors.green(`${prop}: `),colors.bgRed(` ${ele[prop]} `));
        } else if (prop !== 'type') {
          console.log(colors.green(`${prop}: `),colors.grey(`${ele[prop]}`));
        }
      }
    }
  })
  fullScreen('-');
}

/**
 * 打印下载信息
 * @param  {Object} data 下载目标数据
 */
exports.downLoadDetail = function(data) {
  process.stdout.write(`>>>\n`.green);
  console.log(`正在下载课程 : `.green,colors.bgGreen(`${data.title}`));
  data.items.forEach(function(item) {
    if (item.type === 'chapter') {
      process.stdout.write(`+ -- ${item.title}\n`.green);
    } else if (item.type === 'lesson') {
      process.stdout.write(`+ --- ${item.title}\n`.green);
    }
  })
  process.stdout.write(`<<<\n`.green);
}

/**
 * 空行
 */
exports.br = function(){
  process.stdout.write('\n');
}

/**
 * 打印下载进度
 * @param  {Number} progress 进度值
 */
exports.download = function(progress) {
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write(`[${scaleChar(progress,'=')}`.cyan);
  process.stdout.cursorTo(WIDTH - progress.length - 2);
  process.stdout.write(`${progress}%]`.cyan);
}

/**
 * 打印结束信息
 * @param  {Object} opts 下载过程信息
 */
exports.finish = function(opts){
  console.log(`[[ 下载完成，总共耗时`.green,colors.red(`${opts.time}`),`ms ]] `.green);
}

/**
 * 适配终端宽度打印
 * @param  {String} char 要显示的字符
 */
function fullScreen(char) {
  for(let i = 0; i < WIDTH; i++) {
    process.stdout.write(char.grey);
  }
  process.stdout.write('\n');
}

function scaleChar(progress,char) {
  let str = '',
      len = parseInt(WIDTH * (progress / 100)) - progress.length - 4;
  len = len > 0 ? len : 0;
  for(let i = 0; i < len; i++) {
    str += (char || '=') ;
  }
  return str;
}