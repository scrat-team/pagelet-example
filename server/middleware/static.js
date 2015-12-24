var serve = require('koa-static');

module.exports = function (options) {
  var root = options.root;
  delete options.root;
  if (options.maxAge) {
    options.maxAge *= 1000;
  }
  return serve(root, options);
};