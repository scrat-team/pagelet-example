var Mock = require('mockjs');
var URL = require('url');

module.exports = function(ctx){
  var query = JSON.parse(URL.parse(typeof ctx === 'string' ? ctx : ctx.url, true).query.request);

  //语法参见 http://mockjs.com/
  var categoryData = [{id: 1, name: '新游', code: 'new_game'},{id: 2, name: '囧图段子', code: 'funnyword_pic'},{id: 3, name: '游戏资讯', code: 'game_news'},{id: 4, name: '动漫', code: 'comic'},{id: 5, name: '囧图', code: 'funny_pic'},{id: 6, name: '段子', code: 'happy_words'},{id: 7, name: '综合', code: 'funny_synthesize'},{id: 8, name: '游戏评测', code: 'game_test'},{id: 9, name: '游戏爆料', code: 'game_fact'},{id: 10, name: '游戏头条', code: 'game_headline'},{id: 11, name: '日韩速递', code: 'game_rihan'},{id: 12, name: '动漫杂谈', code: 'comic_chatting'},{id: 13, name: '动漫资讯', code: 'comic_news'},{id: 14, name: '美图欣赏', code: 'comic_pic'},{id: 15, name: '动漫周边', code: 'comic_side'},{id: 16, name: '动漫美声', code: 'comic_voice'},{id: 17, name: '动漫游戏', code: 'comic_game'},{id: 18, name: 'COSPLAY', code: 'comic_cosplay'}];

  var mockData = Mock.mock({
    'data|10-20': [{
      'newsId': '@integer(100, 2000)',
      'title': function(){
        return 'ID: ' + this.newsId + ' ' + Mock.Random.title();
      },
      'categoryId': function(){
//        var index = Mock.Random.integer(1, categoryData.length - 1);
//        return categoryData[index].id;
        return 3; //{id: 3, name: '游戏资讯', code: 'game_news'}
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
    }]
  });
  return mockData.data;
};