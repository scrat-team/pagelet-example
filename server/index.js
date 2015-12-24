var path = require('path');
var fs = require('fs');
var cluster = require('cluster');
var koa = require('koa');
var mount = require('koa-mount');
var utils = require('./utils/utils');
var app = module.exports = koa();

var meta = require('../package.json');
meta.versionCode = utils.versionCode(meta.version);
var root = path.resolve(__dirname, '../').replace(/\/+$/, '');

//set env for uae
if(!app.env) {
  if (process.env['UAE_MODE'] === 'PROD') {
    app.env = 'production';
  } else if (process.env['UAE_MODE'] === 'DEV') {
    app.env = 'development';
  }
}
var PROD = (app.env || '').toLocaleLowerCase() === 'production';

app.name = meta.name;
app.proxy = true;
app.meta = meta;
app.port = process.env['PORT'] || 5000;
app.keys = [ meta.name + '_147258' ];
app.logger = require('log4js').getLogger();
app.root = root;
app.prod = PROD;
app.uae = process.env.hasOwnProperty('UAE_MODE');
app.config = require(path.join(root, 'conf/config.json'));

require('./utils/logger')(root, app.config['logger']);

cluster.isMaster && app.logger.info('PROD = %s, env = %s, uae = %s, app.config = %j', PROD, app.env, process.env['UAE_MODE'], app.config);

process.on('uncaughtException', function (err) {
  (app.logger || console).error('Uncaught exception:\n', err.stack);
});

var middleware = {
  combo: {
    root: root + '/public',
    cache: PROD,
    maxAge: PROD ? 60 * 60 * 24 * 365 : 0
  },

  'static': {
    root: root + '/public',
    maxAge: PROD ? 60 * 60 * 24 * 365 : 0
  },

  engine: {
    root: root + '/views',
    ext: 'tpl',
    scrat: {
      map: root + '/config/map.json',
      cacheMap: PROD,
      logger: console
    },
    swig: {
      cache: (PROD || app.uae) ? 'memory' : false,
      filters: [
        require('./utils/utils.js')
      ]
    }
  },

  router: {
    root: root + '/server/controller'
  },

  mock: {
    root: root + '/server/mocks'
  }
};

for (var key in middleware) {
  if (middleware.hasOwnProperty(key)) {
    Object.defineProperty(middleware, key, {
      value: require('./middleware/' + key)(middleware[key], app),
      enumerable: true
    });
  }
}

app.use(mount('/co', middleware.combo));
app.use(mount('/public', middleware.static));
app.use(function*(next){
  this.state.title = app.config.siteTitle || '九游';
  yield* next;
});
app.use(middleware.engine);
app.use(middleware.router());

app.on('error', function(err, ctx){
  if (app.env.toLowerCase() !== 'test') {
    if(PROD) {
      app.logger.error("%s - %j", ctx.url, err.stack);
    }else{
      app.logger.error('Error', ctx.url, err);
    }
  }
});

app.startServer = function(){
  app.server = app.listen(app.port, function () {
    cluster.isMaster && app.logger.info('[%s] %s server listening on port %d', app.env.toUpperCase(), app.name, app.port);
  });
};

if (require.main === module) {
  app.startServer();
}