(function(global, undefined){

  pagelet.router('*', function(ctx, options, e, next){
    // 前端路由拦截
    console.info('pagelet.router', ctx, options);
    next();
  });
})(window);