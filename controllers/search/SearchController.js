const getSiteData = require('../../functions/getSiteData');
const getPopNews = require('../../functions/getPopNews');
const getTweets = require('../../functions/getTweets');
const getToday = require('../../functions/getToday');

const db = require('../../config/db');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(db.name, db.user, db.password, db.config);

const News = sequelize.import('../../models/news');
const Source = sequelize.import('../../models/sources');
const Category = sequelize.import('../../models/categories');
const Queries = sequelize.import('../../models/queries');

News.belongsTo(Source, {foreignKey: 'id_source'});
News.belongsTo(Category, {foreignKey: 'id_category'});

const Op = Sequelize.Op;

exports.popular = function(req, res) {
  res.send({status: true, data: 'Пицца не дорого'});
};

exports.search = function(req, res) {
  const q = req.query.q;
  // let responseData = [];
  // res.send({status: true, data: q});

  // TODO remove stop words
  let words = q.split(' ').filter( w => w.length > 3).map( w => w.toLowerCase());

  let responseData = {
    isAuth: req.isAuthenticated(),
    query: q,
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
      return News.findAll({
        where:{
          [Op.or]: words.map( w => { return {title:{[Op.like] : `%${w}%`}} })
        },
        order: [
          ['id', 'desc']
        ],
        include: [ Source, Category]
      })
    })
  .then(news => {
    responseData.news = news;

    if(req.isAuthenticated()){

      Queries.create({
        id_user: req.user.id,
        text: words.join(',')
      }).then(() => {
        res.render('searchResult', responseData);
      });

      return;
    }

    res.render('searchResult', responseData);
  })

};