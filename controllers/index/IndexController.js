const getSiteData = require('../../functions/getSiteData');
const getPopNews = require('../../functions/getPopNews');
const getTweets = require('../../functions/getTweets');
const getToday = require('../../functions/getToday');


const db = require('../../config/db');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(db.name, db.user, db.password, db.config);


/** Import models */
const News = sequelize.import('../../models/news');
const Source = sequelize.import('../../models/sources');
News.belongsTo(Source, {foreignKey: 'id_source'});


exports.getPage = function(req, res) {
  let responseData = {
    isAuth: req.isAuthenticated(),
    index: true,
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
  .then(events => {
    responseData.events = events;
    res.render('index', responseData);
  });

};

exports.getNews = function(req, res) {
  const limit = 21;
  const page = req.query.page ? parseInt(req.query.page) - 1 : 0;
  const offset =  limit * page;

  News.findAll({
    order: [
      ['datetime', 'DESC']
    ],
    include: [ Source],
    attributes:['id', 'title', 'description', 'datetime', 'views', 'read', 'image', 'is_good'],
    limit, offset
  })
  .then(news=>{
    res.send({status: true, data:news});
  })
  .catch(err=> {
    res.send({status: false});
    console.log(err)
  });
};

exports.getStrip = function(req, res) {
  const limit = 7;

  News.findAll({
    where:{
      is_vip: true
    },
    order: [
      ['datetime', 'DESC']
    ],
    limit,
  })
  .then(news => {
    res.send({status: true, data: news});
  })
  .catch(err => {
    res.send({status: false});
    console.log(err)
  });
};