const path = require('path');
const urlmock = require('urlmock');
const router = module.exports = require('koa-router')();

router.mountPath = '/';

/**
 * 主页，入口页
 */
router.get("/", function*(){
  var response = getMockData(this, {
    host: 'cs',
    mock: true,
    service: '/api/test.list',
    data: {

    }
  });
  console.info(response.data);

  // page/list/list.tpl
  yield this.render('list', Object.assign({layout:'layout'}, {
    list : response.data,
    title: "scrat pagelet"
  }));
});

router.get("/detail/:id(\\d+)", function*(){
  var id = this.params.id;
  var response = getMockData(this, {
    host: 'cs',
    service: '/api/test.detail',
    mock: true,
    data: {
      id: id
    }
  });
  console.info(response.data);

  // page/detail/detail.tpl
  yield this.render('detail', Object.assign({
    layout:'layout',
    title: "detail:" + response.data.newsId
  }, {
    newsInfo: response.data
  }));
});

function getMockData(context, config) {
  var service = '/' + config.service.replace(/^\//, '');
  var mockDir = path.join(context.app.root || process.cwd(),  '/server/mocks');
  var mock = config.mock === true ? 'default' : config.mock;
  var mockData = {};

  if (mock) {
    try {
      var mockUrl = service + '?__scene=' + mock + '&request=' + encodeURIComponent(JSON.stringify(config));
      mockData = urlmock(mockDir, mockUrl);
      if(!mockData.state){
        mockData = {
          state: {
            "code": 2000000,
            "msg": "操作成功"
          },
          data: mockData
        }
      }
      mockData.id = +new Date();
      mockData.mock = mockUrl;
    }catch(err){
      console.error(err);
    }
  }

  console.log('mock', mockData);
  return mockData;
}