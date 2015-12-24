  var Mock = require('mockjs');
  var URL = require('url');

  module.exports = function(ctx){
    var query = JSON.parse(URL.parse(typeof ctx === 'string' ? ctx : ctx.url, true).query.request);

    //语法参见 http://mockjs.com/
    var categoryData = [{id: 1, name: '新游', code: 'new_game'},{id: 4, name: '动漫', code: 'comic'},{id: 5, name: '囧图', code: 'funny_pic'},{id: 6, name: '段子', code: 'happy_words'}];

    var mockData = Mock.mock({
      'data': {
        'newsId': '@integer(100, 2000)',
        'title': function(){
          return 'ID: ' + this.newsId + ' ' + Mock.Random.title();
        },
        'categoryId': function(){
          var index = Mock.Random.integer(1, categoryData.length - 1);
          return categoryData[index].id;
        },
        'categoryName': function(){
          var index = categoryData.findIndex(function(item){
            return item.id == this.categoryId;
          }, this);
          return categoryData[index].name;
        },
        'categoryCode': function(){
          var index = categoryData.findIndex(function(item){
            return item.id == this.categoryId;
          }, this);
          return categoryData[index].code;
        },
        'sourceUrl': '@url()',
        'author': '@chineseName()',
        'publishTime': '@now()',
        'createTime': '@now()',
        'modifyTime': '@now()',
        'websiteCode': '@integer(1, 5)',
        'summary': '@sentence()',
        'content': '@sentence(100, 500)',
        'imageList|0-4': [{
          'sourceUrl': function(){
            if (Math.random() > 0.5) {
              return Mock.Random.image('200x100', '#00405d', '#999', 'gif');
            }
            return  Mock.Random.image();
          },
          'localizedUrl': '@image()',
          'height|200-600': 300,
          'width|200-600': 300
        }]
      }
    });
    return mockData.data;
  };