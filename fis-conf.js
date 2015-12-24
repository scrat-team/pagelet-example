var meta = require('./package.json');
fis.config.set('name', meta.name);
fis.config.set('version', meta.version);
fis.config.set('project.exclude', ['node_modules/**', 'output/**', 'dist/**', 'fis-conf.js']);

fis.seo(meta.name);
fis.config.set('framework.comboPattern', '/co??%s');

fis.config.merge({
  settings: {
    optimizer: {
      'png-compressor': {
        type: 'pngquant' //default is pngcrush
      }
    }
  }
});

//UAE配置, 修改这里时, 要注意UAE是不是也配置了, 会覆盖此处的值
fis.config.set('uae_conf.config', {
  'description': 'UAE 会自动修改这个文件中的配置，请勿手工修改. 注意: 在UAE界面修改时,如果是字符串, 必须额外加双引号, 而且必须有层级, 否则UAE界面无法写入',

  'siteTitle': 'NineGame Pagelet Example',

  'logger': {
    'dir': 'private/log',
    'maxCount': 180,
    'levels': {
      '[all]': 'INFO'
    }
  },

  'csp': {
    reportOnly: false
  }
});

//UAE上传, 用法 scrat release -opmcuDd remote
//fis.config.set('settings.deploy.compress.remote', {
//  url: 'http://uae.ucweb.local/1766/upload.json',
//  uploadField: 'files[]',
//  auth: {
//    username: '',
//    password: ''
//  }
//});

// 雪碧图
fis.config.set('settings.spriter.csssprites', {
  scale: 0.5
});
