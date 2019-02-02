const getSiteData = require('../../functions/getSiteData');
const getToday = require('../../functions/getToday');
const getPopNews = require('../../functions/getPopNews');
const getTweets = require('../../functions/getTweets');
const getRecommendedNewsByTags = require('../../functions/getRecommendedNewsByTags');


const db = require('../../config/db');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(db.name, db.user, db.password, db.config);
const Op = Sequelize.Op;


/** Import models */
const News = sequelize.import('../../models/news');
const Source = sequelize.import('../../models/sources');
const Category = sequelize.import('../../models/categories');
const User = sequelize.import('../../models/users');
const NewsTags = sequelize.import('../../models/news_tags');
const Tags = sequelize.import('../../models/tags');

News.belongsTo(Source, {foreignKey: 'id_source'});
News.belongsTo(Category, {foreignKey: 'id_category'});

const USER_BASED_ALGORITHM_PERCENT = 0.6;
const TAGS_BASED_ALGORITHM_PERCENT = 0.4;

const PER_PAGE = 21;
const PER_PAGE_DAY = 7;

exports.getPage = function(req, res) {
  let responseData = {
    isAuth: req.isAuthenticated(),
    feed: true,
    is_dark_theme: req.isAuthenticated() ? req.user.is_dark_theme : false

  };

  getSiteData()
    .then( data => {
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
    .then(events => {
      responseData.events = events;

      res.render('feed', responseData);
    })
};

exports.getNews = function(req, res) {
  const type = req.body.type || 'weight';
  const page = req.body.page || 0;

  let sameUsersViews = [];

  let sameUsersLikes = [];

  const currentUserViews = req.user.views ? req.user.views.split(',').filter( v => parseInt(v)) : [];
  const currentUserLikes = req.user.likes ? req.user.likes.split(',').filter( l => parseInt(l)) : [];

  const usersViewedViewedNews = [];
  const usersLikedViewedNews = [];

  // похожие пользователи
  const sameUsers = {};

  // новости алгоритма А (суммарными весами пользователей)
  let newsWeight = {};

  // новости алгоритма В (по ТЕГАМ)
  let newsWeightTags = {};

  // результат сложения двух алгоритмов (новости с весами)
  let totalNewsWeight = {};

  // все просомтренные и пролайканные новости похожих пользователей
  const usersNews = [];

  News.findAll({
    where:{
      id: currentUserViews
    }
  })
  .then( viewedNews => {

    // новости, которые были просмотрены текущим пользователем
    viewedNews.forEach( n => {

      // пользователи, которые смотрели/лайкали новость, которую смотрел текущий пользователь
      const users_views = n.users.split(',').filter( u => parseInt(u) && parseInt(u) !== req.user.id);
      const users_likes = n.likes ? n.likes.split(',').filter( u => parseInt(u) && parseInt(u) !== req.user.id): [];

      // оценка для пользователя - если смотрел, что смотрел текущий юзер = 1
      // - если лайкал, что смотрел текущий юзер = 2 (value +1)
      // - если смотрел, что лайкал текущий юзер = 3
      // - если лайкал, что лайкал текущий юзер = 4 (value + 1)

      const value = currentUserLikes.includes(n.id) ? 3 : 1;

      // устанавливаем/накапливаем оценку для пользователей
      users_views.forEach( u => {
        sameUsers[u] = sameUsers[u] ? sameUsers[u]+value : value;
      });

      users_likes.forEach( u => {
        sameUsers[u] = sameUsers[u] ? sameUsers[u]+value+1 : value+1;
      });

    });


    // User findAll where id in sameUsers
    return User.findAll({where:{ id: Object.keys(sameUsers) }})
  })
  .then( users => {

    users.forEach(u => {

      // parse and split likes and views news of this users
      // exclude news, that user seen
      const views = u.views.split(',').filter( n => parseInt(n) && !currentUserViews.includes(n));
      const likes = u.likes ? u.likes.split(',').filter( n => parseInt(n) && !currentUserViews.includes(n)): [];


      // make one full array of this news
      // for all news in this full array
      // if news only in view - add weight of user
      // if news in likes - add weight of user*1.5
      views.forEach( n => {
        let value = sameUsers[u.id];
        if(likes.includes(n))
          value*=1.5;

        newsWeight[n] = newsWeight[n] ? newsWeight[n] + value : value;
      })
    });

    return getRecommendedNewsByTags(req.user);
  })
  .then(recNewsTags => {

    // нормализация
    newsWeight = normalize(newsWeight);
    newsWeightTags = normalize(recNewsTags);

    for(let key in newsWeight){
      const value = newsWeight[key] * USER_BASED_ALGORITHM_PERCENT;
      totalNewsWeight[key] = totalNewsWeight[key] ? totalNewsWeight[key] + value : value;
    }

    for(let key in newsWeightTags){
      const value = newsWeightTags[key] * TAGS_BASED_ALGORITHM_PERCENT;
      totalNewsWeight[key] = totalNewsWeight[key] ? totalNewsWeight[key] + value : value;
    }

    const params = {
      where:{ id: Object.keys(totalNewsWeight)},
      include: [ Source, Category],
    };
    return News.findAll(params)
  })
  .then( news => {

    // новости сгруппированные по дням
    const groupedByDate = {};

    news.forEach(n => {
      let date = new Date(n.datetime).toLocaleDateString();
      if(!groupedByDate[date]){
        groupedByDate[date] = [];
      }
      n.weight = totalNewsWeight[n.id];
      groupedByDate[date].push(n);
    });

    if(type === 'weight'){
      news.sort((a,b) => {
        if(a.weight > b.weight)
          return -1;
        if(a.weight < b.weight)
          return 1;
        return 0;
      });
      news = news.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);
      res.send({status: true, data: news});
      return;
    }

    // новости сгруппированные по дням в массиве
    let groupedNewsArray = [];

    for(let key in groupedByDate){
      // groupedNewsArray.push({date: key, items: groupedByDate[key]});
      groupedNewsArray.push(groupedByDate[key]);
    }

    groupedNewsArray.sort((a, b) => {
      const a_dt = new Date(a[0].datetime).getTime();
      const b_dt = new Date(b[0].datetime).getTime();
      if(a_dt > b_dt)
        return -1;
      if(a_dt < b_dt)
        return 1;
      return 0;
    });

    for(let i = 0; i < groupedNewsArray.length; i++){
      groupedNewsArray[i].sort((a,b) => {
        if(a.weight > b.weight)
          return -1;
        if(a.weight < b.weight)
          return 1;
        return 0;
      });
    }

    groupedNewsArray = groupedNewsArray.slice(page * PER_PAGE_DAY, page * PER_PAGE_DAY + PER_PAGE_DAY);

    res.send({status: true, data: groupedNewsArray});
  });
};

exports.getShared = function(req, res) {
  const type = req.body.type || 'weight';
  const page = req.body.page || 0;

  const currentUserFriends = req.user.friends ? req.user.friends.split(',').filter( f => parseInt(f)) : [];

  // новости, которыми поделились друзья
  const friendsShared = {};
  User.findAll({where:{id: currentUserFriends}})
  .then(friends => {

    friends.forEach(f => {
      const oneFriendShared = f.share ? f.share.split(',').filter( s => parseInt(s)) : [];
      oneFriendShared.forEach( n => {
        if(!friendsShared[n])
          friendsShared[n] = [];
        friendsShared[n].push({color: f.color, name: f.name, id: f.id})
      })
    });

    const params = {
      where:{ id: Object.keys(friendsShared)},
      include: [ Source, Category],
      order: [
        ['datetime', 'DESC']
      ],
      // limit,
    };

    return News.findAll(params)
  })
  .then(news => {

    let result = [];
    news.forEach( n =>{
      // n.friends = friendsShared[n.id];
      const {id, title, image, description, datetime, read, category, source, } = n;
      result.push({id, title, image, description, datetime, read, category, source,  friends: friendsShared[id]});
    });


    res.send({status: true, data: result});
  }).catch(err => {
    console.log(err);
  });
};

function normalize(object) {
  // максимальный вес
  const max = Math.max.apply(null, Object.values(object));
  const min = Math.min.apply(null, Object.values(object));

  for(let key in object){
    if(max === min){
      object[key] = object[key] / min;
    }
    else
      object[key] = (object[key] - min)/ (max - min);
  }
  return object;
}