const getSiteData = require('../../functions/getSiteData');
const getPopNews = require('../../functions/getPopNews');
const getTweets = require('../../functions/getTweets');
const getToday = require('../../functions/getToday');
const isIdInString = require('../../functions/isIdInString');


const db = require('../../config/db');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(db.name, db.user, db.password, db.config);


/** Import models */
const News = sequelize.import('../../models/news');
const Source = sequelize.import('../../models/sources');
const Category = sequelize.import('../../models/categories');
const User = sequelize.import('../../models/users');
const NewsTags = sequelize.import('../../models/news_tags');
const Tags = sequelize.import('../../models/tags');

News.belongsTo(Source, {foreignKey: 'id_source'});
News.belongsTo(Category, {foreignKey: 'id_category'});
// News.belongsTo(Tag, {foreignKey: 'id_category'});

const PERCENT = 0.5;
const LIMIT = 16;

exports.getPage = function(req, res) {
  let id = req.params['id'];

  let previousUrl = req.header('Referer') || '/';

  let responseData = {
    isAuth: req.isAuthenticated(),
    is_dark_theme: req.isAuthenticated() ? req.user.is_dark_theme : false
  };
  getSiteData()
  .then(data => {
    responseData.siteData = data;
    return getPopNews()
  })
  .then( popNews => {
    responseData.popNews = popNews;
    return getTweets();
  })
  .then( tweets => {
    responseData.tweets = tweets;
    return getToday();
  })

  /* today events */
  .then( events => {
    responseData.events = events;
    return News.findById(id);
    // return News.findById(id);
  }).then( news => {

    if(previousUrl.includes('/feed')){
      // переход с ленты
      news.views_feed +=1;
      return news.save()
    }
    else if(previousUrl.includes('/news')){
      if(req.isAuthenticated()){
        // переход со страницы новости (алгоритм по тегам новости и пользователя)
        news.views_user +=1;
        return news.save()
      }
      else {
        // переход со страницы новости (алгоритм по тегам новости)
        news.views_guest +=1;
        return news.save()
      }
    }
    return;
  }).then(news => {
    res.render('newsPage', responseData);
  })
};

exports.getNews = function(req, res) {
  let id = req.params['id'];
  let news = null;
  let tags = null;

  let responseData = {
    isAuth: req.isAuthenticated(),
  };
  News.findOne({where:{id}, include: [ Source, Category]})
  /* requested one news */
  .then(newsDb => {
    news = newsDb;
    return NewsTags.findAll({
      where: {
        id_news: news.id
      }})
  })
  .then( tagsDB => {

    // берем названия тегов
    return Tags.findAll({
      where:{
        id: tagsDB.map( t => t.id_tag)
      }
    })
  })
  .then( tags => {
    if(!req.isAuthenticated()) {
      res.send({status: true, data: {news, userCanLike: false, tags, isAuth: req.isAuthenticated()}});
      return;
    }
    else if(isUserRead(req.user, id)){
      const userLikes = isUserLikes(req.user, id);
      res.send({status: true, data: {news, tags, userCanLike: !isUserLikes(req.user, id), userLiked: userLikes, isAuth: req.isAuthenticated()}});
      return;
    }

    news.views += 1;
    news.users = news.users? news.users+`${req.user.id},`:`,${req.user.id},`;

    news.save().then(n =>{
      let userNewTags = '';
      tags.forEach( t => userNewTags+= `${t.id},`);

      User.findById(req.user.id).then(user => {
        user.views = user.views ? user.views + `${id},`: `${id},`;
        user.tags = user.tags ? user.tags + userNewTags : userNewTags;
        return user.save()
      }).then(()=>res.send({status: true, data: {news: n, userCanLike: true, tags, isAuth: req.isAuthenticated()}}));
    });
  });
};

exports.likeNews = function(req, res) {
  let id = req.params['id'];
  News.findById(id)
  .then(news=>{
    if(isUserLikes(req.user, id)) {
      res.send({status: false});
      return;
    }
    news.likes = news.likes? news.likes+`${req.user.id},`:`,${req.user.id},`;
    news.save().then(n => {
      NewsTags.findAll({
        where:{
          id_news: n.id
        }
      }).then(tags => {
        let userNewTags = '';
        tags.forEach( t => userNewTags += `${t.id_tag},`);
        User.findById(req.user.id).then(user=>{
          user.likes = user.likes? user.likes + `${id},`: `${id},`;
          user.tags = user.tags ? user.tags + userNewTags : userNewTags;
          return user.save()
        }).then(()=>res.send({status: true}));
      });
    });
  });
};

exports.shareNews = function(req, res) {
  let id = req.params['id'];

  let currentUserSharedNews = req.user.share ? req.user.share.split(',').filter( l => parseInt(l)).map( s => parseInt(s)) : [];

  News.findById(id)
  .then(news => {

    if(currentUserSharedNews.includes(parseInt(news.id))){
      res.send({status: false, error: 'Вы уже поделились данной новостью ранее'});
      return;
    }

    User.findById(req.user.id)
    .then(user=>{
      user.share = user.share ? user.share + `${id},`: `${id},`;
      return user.save()
    })
    .then(()=>res.send({status: true}));
  });
};


exports.getRecommendedNews = function(req, res) {
  let id = req.params['id'];
  let myTags = {};

  // ид новостей с весами (сумма весов всех тэгов этой новости)
  let newsWithWeight = {};

  News.findOne({where:{id}, include: [ Source, Category]})
  /* requested one news */
  .then(news => {

    const Op = Sequelize.Op;
    let newsTags = [];
    let userTags = [];

    if(!req.isAuthenticated()) {
      NewsTags.findAll({
        where:{
          id_news: news.id
        }
      })
      .then(tags => {
         tags.forEach( t => {
          myTags[t.id_tag] = 1;
        });

        return NewsTags.findAll({
          where:{
            id_tag: Object.keys(myTags)
          }
        })
      })
      .then(newsTags => {

        newsTags.forEach( e => {
          if (newsWithWeight[e.id_news]) {
            newsWithWeight[e.id_news] += myTags[e.id_tag] ? myTags[e.id_tag] : 0;
          }
          else {
            newsWithWeight[e.id_news] = myTags[e.id_tag] ? myTags[e.id_tag] : 0;
          }
        });

        return News.findAll({
          where:{
            id: Object.keys(newsWithWeight),
            [Op.and]: {id: {[Op.ne]:news.id}}
          },
          limit: LIMIT,
          order: [
            ['id', 'desc']
          ],
          include: [Source]
        })

      }).then(fullNews => {

        fullNews.sort((a, b) => {
          if(newsWithWeight[a.id] > newsWithWeight[b.id])
            return -1;

          if(newsWithWeight[a.id] < newsWithWeight[b.id])
            return 1;
          return 0;
        });
        res.send({status: true, data: {news:fullNews}});

      });

      return;
    }

    NewsTags.findAll({
      where:{
        id_news: news.id
      }
    })
    .then(tags => {
      newsTags = tags;
      return User.findById(req.user.id)
    })
    .then(user => {
      userTags = user.tags;

      let resultTags = processTags(userTags.split(','));

      let max = 0;

      for(let key in resultTags){
        if(resultTags[key] > max)
          max = resultTags[key];
      }

      newsTags.forEach( t => {
        resultTags[t.id_tag] = max + 1;
      });

      for(let key in resultTags){
        if(resultTags[key] >= max*PERCENT){
          myTags[key] = resultTags[key];
        }
      }

      return NewsTags.findAll({
        where:{
          id_tag: Object.keys(myTags)
        }
      })
    })
    .then( newsTags => {

      const viewedNews = req.user.views.split(',').filter( e => parseInt(e));

      newsTags.forEach((e, i) => {

        // не берем ранее просмотренные новости
        if(!viewedNews.includes(`${e.id_news}`)) {
          if (newsWithWeight[e.id_news]) {
            newsWithWeight[e.id_news] += myTags[e.id_tag] ? myTags[e.id_tag] : 0;
          }
          else {
            newsWithWeight[e.id_news] = myTags[e.id_tag] ? myTags[e.id_tag] : 0;
          }
        }
      });

      return News.findAll({
        where:{
          id: Object.keys(newsWithWeight),
        },
        limit: LIMIT *5,
        order: [
          ['id', 'desc']
        ],
        include: [Source]
      })
    })
    .then( fullNews => {

      fullNews.sort((a, b) => {
        if(newsWithWeight[a.id] > newsWithWeight[b.id])
          return -1;

        if(newsWithWeight[a.id] < newsWithWeight[b.id])
          return 1;
        return 0;
      });

      res.send({status: true, data: {news:fullNews}});

    })
    .catch(err => {
      console.log(err);
    });
  });
};


function processTags(tags, result = {}) {

  tags.forEach( t => {
    let num = parseInt(t);
    if(num){
      if(result[t])
        result[t]++;
      else
        result[t] = 1;
    }
  });

  return result;
}


function isUserRead(user, id) {
  if(!user.views){
    return false;
  }
  // return user.views.includes(id);
  return isIdInString(id, user.views);
}

function isUserLikes(user, id) {
  if(!user.likes){
    return false;
  }
  return isIdInString(id, user.likes);
}