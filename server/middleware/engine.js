var path = require('path');
var swig = require('scrat-swig');
var merge = require('merge');

module.exports = function (options, app) {
  options.ext = options.ext || 'tpl';
  options.layout = options.layout || 'layout';

  //extend swig with scrat
  extendSwig(options);
  swig.middleware(options.scrat);

  //add `render` fn to app, usage: `yield this.render(tplPath, locals);`
  app.context.render = getRenderPageFn(options);
  app.context.renderView = getRenderViewFn(options);

  return function *swigMiddleware(next){
    var pagelets = this.get('X-Pagelets') || this.query['_pagelets'];
    if(pagelets){
      this.type = 'json';
      //this.set('Cache-Control', 'no-cache, no-store');
      //this.set('Pragma', 'no-cache');
      //this.set('Expires', 0);
      this.state._pagelets = pagelets;
    } else {
      this.type = 'html';
    }
    yield* next;
  };
};

function injectUUID (app, locals) {
  var uuid = app.response.get('X-UUID');
  if (uuid) {
    locals.uuid = uuid;
  }
  return locals;
}

/**
 * 渲染components/page目录下的页面
 */
function getRenderPageFn(options) {
  return function *renderPage(page, locals) {
    var startTime = Date.now();
    var layout = locals.layout || options.layout;
    var fakePath = path.join(options.root, page.replace(/\//g, '_').replace(/\.tpl$/, '') + '.tpl');
    var data = merge(this.state, {flash: this.flash}, injectUUID(this, locals));
    var source = `{% extends 'layout/${layout}.tpl' %} {% block content %} {% require $id='page/${page}' %} {% endblock %}`;
    var tplFn = swig.compile(source, {filename: fakePath});
    var html = tplFn(data);
    if (!options.custom) {
      this.body = html;
    }
    this.set('X-Render-Time', Date.now() - startTime);
    return html;
  }
}

/**
 * 渲染views目录下的页面
 */
function getRenderViewFn(options) {
  function renderFile(pathName, locals) {
    return function (done) {
      swig.renderFile(pathName, injectUUID(this, locals), done);
    };
  }

  return function *render(view, locals) {
    var startTime = Date.now();
    // default extname
    var ext = path.extname(view);

    if (!ext) {
      ext = '.' + options.ext;
      view += ext;
    }

    // resolve
    view = path.resolve(options.root, view);

    var data = merge(this.state, {flash: this.flash}, locals);

    var html = yield renderFile(view, data);
    if (!options.custom) {
      this.body = html;
    }
    this.set('X-Render-Time', Date.now() - startTime);
    return html;
  }
}

/**
 * 扩展swig
 */
function extendSwig(options){
  var swigOptions = options.swig || {};

  //custom filters
  if(swigOptions.filters){
    var filters = swigOptions.filters;
    filters = Array.isArray(filters) ? filters : [filters];
    filters.forEach(function(obj){
      for(var filterName in obj){
        if(obj.hasOwnProperty(filterName)){
          swig.setFilter(filterName, obj[filterName]);
        }
      }
    });
    delete swigOptions.filters;
  }

  //custom tags
  if(swigOptions.tags){
    var tags = swigOptions.tags;
    tags = Array.isArray(tags) ? tags : [tags];
    tags.forEach(function(obj) {
      for (var tagName in obj) {
        if (obj.hasOwnProperty(tagName)) {
          var tag = tags[tagName];
          swig.setTag(tagName, tag.parse, tag.compile, tag.ends, tag.blockLevel);
        }
      }
    });
    delete swigOptions.tags;
  }

  //custom extensions
  if(swigOptions.extensions){
    var extensions = swigOptions.extensions;
    extensions = Array.isArray(extensions) ? extensions : [extensions];
    extensions.forEach(function(obj) {
      for (var extName in obj) {
        if (obj.hasOwnProperty(extName)) {
          swig.setExtension(extName, obj[extName]);
        }
      }
    });
    delete swigOptions.extensions;
  }

  //defaults
  swig.setDefaults(swigOptions);
}