'use strict';

let colors = require('colors');
let config = require('../conf/config.local');

const WIDTH = process.stdout.columns;

exports.viewCourses = function(source) {
  console.log(colors.magenta(`Searching course list about : ${source.keyword}`));
  source.items.forEach(function(ele, index) {
    fullScreen('-');
    for(let prop in ele) {
      if (prop === 'id') {
        console.log(colors.green(`${prop}: `),colors.bgRed(` ${ele[prop]} `));
      } else {
        console.log(colors.green(`${prop}: `),
                    colors.grey(`${ele[prop].substring(0,70)}${prop === 'description' ? '...' : ''}`));
      }
    }
  })

}

exports.viewLessons = function(source) {
  console.log(colors.magenta(`Reading lessons from : ${config.URI.SEARCH_LESSON + source.id}`));
  source.items.forEach(function(ele){
    if (ele.type === 'lesson') {
      fullScreen('-');
      for(let prop in ele) {
        if (prop === 'id') {
          console.log(colors.green(`${prop}: `),colors.bgRed(` ${ele[prop]} `));
        } else if (prop !== 'type') {
          console.log(colors.green(`${prop}: `),colors.grey(`${ele[prop]}`));
        }
      }
    }
  })
  fullScreen('-');
}

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
  process.stdout.write(`<<<\n\n`.green);
}

exports.br = function(){
  process.stdout.write('\n');
}

exports.download = function(progress) {
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write(`[${scaleChar(progress,'=')}`.cyan);
  process.stdout.cursorTo(WIDTH - progress.length - 2);
  process.stdout.write(`${progress}%]`.cyan);
}

exports.finish = function(opts){
  console.log(`[[ 下载完成，总共耗时`.green,colors.red(`${opts.time}`),`ms ]] `.green);
}

function fullScreen(char) {
  for(let i = 0; i < WIDTH; i++) {
    process.stdout.write(char.grey);
  }
  process.stdout.write('\n');
}

function scaleChar(progress,char) {
  let str = '',
      len = parseInt(WIDTH * (progress / 100)) - progress.length - 3;
  len = len > 0 ? len : 0;
  for(let i = 0; i < len; i++) {
    str += (char || '=') ;
  }
  return str;
}