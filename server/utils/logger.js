var log4js = require('log4js');
var fs = require('fs');
var path = require('path');
var moment = require('moment');
var cluster = require('cluster');
var mkdirp = require('mkdirp');
var _ = require('lodash');

module.exports = function(root, options){
  var dataFormatter = require('log4js/lib/date_format.js');
  dataFormatter.ISO8601_FORMAT = 'yy-MM-dd hh:mm:ss';

  var dirName = path.join(root, options.dir);
  mkdirp.sync(dirName);

  var opts = {
    replaceConsole: true,
    appenders: [{
      type: "categoryFilter",
      exclude: ["accesslog", "DataApiProxy", "csp"],
      appender: {
        type: "dateFile",
        filename: path.join(dirName, 'app'),
        pattern: "_yyyyMMdd.log",
        alwaysIncludePattern: true
      }
    }, {
      type: "dateFile",
      filename: path.join(dirName, 'access'),
      pattern: "_yyyyMMdd.log",
      alwaysIncludePattern: true,
      category: 'accesslog',
      layout: {
        type: 'messagePassThrough'
      }
    }, {
      type: "dateFile",
      filename: path.join(dirName, 'proxy'),
      pattern: "_yyyyMMdd.log",
      alwaysIncludePattern: true,
      category: 'DataApiProxy',
      layout: {
        type: 'messagePassThrough'
      }
    }, {
      type: "dateFile",
      filename: path.join(dirName, 'csp'),
      pattern: "_yyyyMMdd.log",
      alwaysIncludePattern: true,
      category: 'csp',
      layout: {
        type: 'messagePassThrough'
      }
    }],
    levels: _.merge({
      "[all]": "INFO",
      "DataApiProxy": "DEBUG"
    }, options.levels)
  };

  if(process.env['NODE_ENV'] !== 'production' && !process.env['UAE_MODE']){
    opts.appenders.push({
      type: 'console'
    });
    opts.levels['[all]'] = 'DEBUG';
  }

  log4js.configure(opts);

  if(options.maxCount > 0){
    startJob(dirName, options.maxCount);
  }

  return log4js;
};


//每天自动执行
function startJob(logDir, maxCount){
  if(cluster.isMaster){
    deleteOldLog(logDir, maxCount);
    //每天晚上2点
    var nextTime = moment().add(1, 'd').add(2, 'h').startOf('day').diff(moment());
    setTimeout(function(){
      startJob(logDir, maxCount);
    }, nextTime);
  }
}

//删除历史日志
function deleteOldLog(logDir, maxCount){
  var logger = log4js.getLogger();
  maxCount = maxCount || 7;
  var oldDate = moment().subtract(maxCount, 'd').startOf('day');
  fs.readdir(logDir, function (err, files) {
    if (err) {
      logger.error(err);
    } else {
      var toDeleteLog = files.filter(function (name) {
        var m = name.match(/^.*?_(\d+)\.log$/);
        if (m) {
          return moment(m[1], 'YYYYMMDD').isBefore(oldDate);
        }
      });

      logger.info('Delete old file before %s days(%s): [%s]', maxCount, oldDate.format('MM-DD HH:mm:SS'), toDeleteLog.join(', '));
      if(toDeleteLog.length) {
        toDeleteLog.forEach(function(file){
          var realPath = path.join(logDir, file);
          if(fs.existsSync(realPath)){
            fs.unlink(realPath, function(err) {
              if (err) {
                console.error(process.pid, err);
              }
            })
          }
        });
      }
    }
  });
}
