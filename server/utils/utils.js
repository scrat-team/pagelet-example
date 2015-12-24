var moment = require('moment');
var _ = require('lodash');
var xss = require('xss');

moment.locale('zh-cn');

/**
 * 去掉HTML标签
 */
exports.removeHtml = function(input) {
  return input && input.replace(/<(?:.|\n)*?>/gm, '')
      .replace(/(&rdquo;)/g, '\"')
      .replace(/&ldquo;/g, '\"')
      .replace(/&mdash;/g,'-')
      .replace(/&nbsp;/g,'')
      .replace(/&gt;/g,'>')
      .replace(/&lt;/g,'<')
      .replace(/<[\w\s"':=\/]*/, '');
};

/**
 * html解码
 */
exports.htmlDecode = function(input){
  if (!input)
    return;
  var strLen = input.length,
      lastFourChars = "",
      currCharCode = "",
      resstr = "";
  for (var k = 0; k < strLen; k++) {
    var currChar = input[k];
    if (currChar == "&" || currChar == "#")
      continue;
    if (currChar == ";") {
      var decodeChar = String.fromCharCode(parseInt(currCharCode));
      if (decodeChar == "<" || lastFourChars) /*html标签开头，则记下四个前缀*/
        lastFourChars += decodeChar;
      else
        resstr += decodeChar;
      if (lastFourChars.length >= 4) {

        resstr += lastFourChars;
        lastFourChars = "";
      }
      currCharCode = "";
    } else
      currCharCode += currChar;
  }
  return resstr;
};

/**
 * 格式化摘要
 * @param input
 */
exports.formatSummary = function(input) {
  return exports.removeHtml(input.replace(/(^\s+|\s+$)/g, '')).replace(/(\n|\\n)/g, '<br>');
};

/**
 * 格式化标题
 * @param input
 */
exports.formatTitle = function(input) {
  var output = exports.removeHtml(input.replace(/(^\s+|\s+$)/g, '')).replace(/(\n|\\n)/g, '');
  //console.error(input.length, output.length, input, output);
  return output;
};

/**
 * format date.
 *
 *     formatDate(new Date(),"yyyy-MM-dd hh:mm:ss")
 *     formatDate(new Date().setHours(0,0,0,0),"yyyy-MM-dd hh:mm:ss")
 *
 * 更建议用类库: [moment.js](http://momentjs.com/)
 *
 * @param {Date/Number} [obj] date to format, support Date or timestamp
 * @param {String} [format] 格式
 * @return {String} 格式化后的字符串
 */
exports.formatDate = function(obj, format){
  var date = obj || new Date();
  if(obj && obj.toString !== '[object Date]'){
    if(isNaN(obj)){
      date = new Date(obj);
    }else{
      date = new Date();
      date.setTime(obj);
    }
  }

  format = format || "yyyy-MM-dd hh:mm:ss";

  var o = {
    "M+" : date.getMonth()+1, //month
    "d+" : date.getDate(),    //day
    "h+" : date.getHours(),   //hour
    "m+" : date.getMinutes(), //minute
    "s+" : date.getSeconds(), //second
    "q+" : Math.floor((date.getMonth()+3)/3),  //quarter
    "S" : date.getMilliseconds() //millisecond
  };
  if(/(y+)/.test(format)){
    format=format.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));
  }
  for(var k in o){
    if(new RegExp("("+ k +")").test(format)){
      format = format.replace(RegExp.$1, RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length));
    }
  }
  return format;
};

/**
 A.小于20秒，显示为刚刚；
 B.大于20秒，小于1分钟,显示1分钟前；
 C.大于1分钟，小于2分钟，显示为2分钟前，以此类推。
 D.大于1小时，直接显示具体时间，格式为hh：mm
 E.超过当日自然日，则显示具体日期，格式为mm-dd  hh:mm
 F.跨年显示格式为yy-mm-dd hh:mm
 * @param time  字符串 或者 时间戳
 * @returns {*}
 */
exports.formatTime = function (time){
  var date;

  if (isNaN(time)) {
    date = new Date(time);
  } else {
    date = new Date();
    date.setTime(time);
  }

  var now = new Date();
  var diff = (+now) - (+date);
  var MINUTE = 1000 * 60;
  var HOUR = MINUTE * 60;

  if (diff < 1000 * 20) {
    return "刚刚";
  } else if (diff < HOUR) {
    return Math.ceil(diff / MINUTE) + "分钟前";
  }
  else if (diff < HOUR * 24 && now.getDate() == date.getDate()) {
    return exports.formatDate(date, 'hh:mm');
  }
  else if (now.getYear() == date.getYear()) {
    return exports.formatDate(date, 'MM-dd hh:mm');
  } else {
    return exports.formatDate(date, 'yyyy-MM-dd hh:mm');
  }
};

/**
 * 格式化时间间隔
 */
exports.formatRelativeTime = function (str) {
  var date = moment(str);
  var now = moment();
  var diff = now.diff(date, 'second');

  if (diff <= 30) {
    return "刚刚";
  } else if (diff < 3600) {
    return Math.ceil(diff / 60) + "分钟前";
  } else if (date.isSame(now, 'day')) {
    return date.format('HH:mm:ss');
  } else if (date.isSame(now, 'year')) {
    return date.format('MM-DD HH:mm:ss');
  } else {
    return date.format('YYYY-MM-DD HH:mm:ss');
  }
};

exports.versionCode = function(str){
  return ('.' + str).replace(/\./g, 'a00').replace(/a0+([0-9]{2})/g, "$1");
};


/**
 * 格式化资讯列表
 */
exports.formatNewsList = function(response, config, options) {
  if(Array.isArray(response.data)){
    // thumb(囧图 first pic)|gif(囧图 first gif)|text（段子）|common(less than 3 pics）|thumbs（3 pics）
    response.data = response.data.map(x => formatNewsItem(x));
  }else{
    response.data = [];
  }
  return response;
};

/**
 * 格式化资讯详情
 */
exports.formatNewsDetail = function(response, config, options) {
  // thumb(囧图 first pic)|gif(囧图 first gif)|text（段子）|common(less than 3 pics）|thumbs（3 pics）
  response.data = formatNewsItem(response.data || {});
  return response;
};

/**
 * 格式化资讯(单个item)
 */
function formatNewsItem(item) {
  //console.info(JSON.stringify(item, null, '  '));
  if (!item) {
    return null;
  }
  var defaultType = 'common';
  // default
  item.categoryType = defaultType;

  // imageList filter，过滤没有localURL的图片
  if (item.imageList && item.imageList.length) {
    item.imageList = item.imageList.filter(function(data){
      return !!data.localizedUrl;
    });
  }

  // 如果summary有html，过滤掉
  item.summary = item.summary && item.summary.replace(/<\/?[^>]+>/gi, '');

  // 段子
  if (item.categoryId == 6) {
    item.categoryType = 'text';
  }
  // 囧图
  else if (item.categoryId == 5) {
    if (item.imageList && item.imageList.length) {
      for (var j = 0, len = item.imageList.length ; j < len; j++) {
        //console.debug("sourceUrl", item.imageList[j].sourceUrl);
        if (item.imageList[j].height > 510) {
          item.categoryType = 'long';
          item.thumbUrl = item.imageList[j].localizedUrl;
          item.originUrl = item.imageList[j].sourceUrl;
          break;
        }
        else if (/\bgif\b/gi.test(item.imageList[j].sourceUrl)) {
          item.categoryType = 'gif';
          item.thumbUrl = item.imageList[j].localizedUrl;
          item.originUrl = item.imageList[j].sourceUrl;
          break;
        }
      }
      
      // 如果没gif，则显示大图
      if (item.categoryType == defaultType) {
        item.categoryType = 'big';
        item.thumbUrl = item.imageList[0].localizedUrl;
        item.originUrl = item.imageList[0].sourceUrl;
      }
    }
    else {
      // 容错，如果item没有imageList，当纯文本
      item.categoryType = 'text';
    }
  }
  else {
    // 有图片
    if (item.imageList && item.imageList.length) {
      var smallImageList = item.imageList.filter(function(data){
        return data.type == 1;
      });
      var largeImageList = item.imageList.filter(function(data){
        return data.type == 2;
      });

      // 先把小图过滤掉，如果没大图，就勉强用小图吧
      item.imageList = largeImageList.length > 0 ? largeImageList : smallImageList;

      // NOTICE 此处为前端打散逻辑，模拟多显示模式，平均显示1张或者多张
      if (item.imageList.length >= 3) {
        if (!(item.newsId % 5) || !(item.newsId % 7) || !(item.newsId % 9)) {
          item.categoryType = 'thumbs';
        }

      }
      else {
        // 用回默认的类型
      }
    }
    // 无图片
    else {
      item.categoryType = 'text';
    }
  }
  return item;
}

/**
 * xss清洗
 * @param {String} input
 */
var xssConfig = {
  whiteList: _.extend({}, xss.whiteList, {
    // 在这里增加其他白名单 tag
    font: ['face', 'color', 'style', 'size', 'class', 'id'],
    img: ['id', 'src', 'class', 'width', 'height']
  })
};
exports.xss = (input) => xss(input, xssConfig);

/**
 * 为数字加上单位：万或亿
 *
 * 例如：
 *      1000.01 => 1000.01
 *      10000 => 1万
 *      99000 => 9.9万
 *      566000 => 56.6万
 *      5660000 => 566万
 *      44440000 => 4444万
 *      11111000 => 1111.1万
 *      444400000 => 4.44亿
 *      40000000,00000000,00000000 => 4000万亿亿
 *      4,00000000,00000000,00000000 => 4亿亿亿
 *
 * @param {number} number 输入数字.
 * @param {number} [decimalDigit] 小数点后最多位数，默认为2
 * @return {string} 加上单位后的数字
 */
exports.addChineseUnit = function() {
  var addWan = function(integer, number, mutiple, decimalDigit) {
    var digit = getDigit(integer);
    if (digit > 3) {
      var remainder = digit % 8;
      if (remainder >= 5) {   // ‘十万’、‘百万’、‘千万’显示为‘万’
        remainder = 4;
      }
      return Math.round(number / Math.pow(10, remainder + mutiple - decimalDigit)) / Math.pow(10, decimalDigit) + '万';
    } else {
      return Math.round(number / Math.pow(10, mutiple - decimalDigit)) / Math.pow(10, decimalDigit);
    }
  };

  var getDigit = function(integer) {
    var digit = -1;
    while (integer >= 1) {
      digit++;
      integer = integer / 10;
    }
    return digit;
  };

  return function(number, decimalDigit) {
    decimalDigit = decimalDigit == null ? 2 : decimalDigit;
    var integer = Math.floor(number);
    var digit = getDigit(integer);
    // ['个', '十', '百', '千', '万', '十万', '百万', '千万'];
    var unit = [];
    if (digit > 3) {
      var multiple = Math.floor(digit / 8);
      if (multiple >= 1) {
        var tmp = Math.round(integer / Math.pow(10, 8 * multiple));
        unit.push(addWan(tmp, number, 8 * multiple, decimalDigit));
        for (var i = 0; i < multiple; i++) {
          unit.push('亿');
        }
        return unit.join('');
      } else {
        return addWan(integer, number, 0, decimalDigit);
      }
    } else {
      return number;
    }
  };
}();
