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

News.belongsTo(Source, {foreignKey: 'id_source'});
News.belongsTo(Category, {foreignKey: 'id_category'});



const NEWS_COUNT = 6;

exports.getPage = function(req, res) {
  let responseData = {
    isAuth: req.isAuthenticated(),
    categories: true,
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

      res.render('categories', responseData);
    })
};

exports.getNews = function(req, res) {

  // const page = req.body.page || 0;

  Category.findAll()
  .then(cats => {
    let promises = [];
    cats.forEach(c => {
      promises.push(new Promise((resolve, reject) => {

        const params = {
          limit: NEWS_COUNT,
          order: [
            ['datetime', 'DESC']
          ],
          where: {id_category : c.id},
          include: [ Source, Category],
        };

        News.findAll(params).then(news => {
          resolve({ id: c.id, name: c.name, news: news})
        })
      }));
    });

    return Promise.all(promises);

  })
  .then(cats => {

    res.send({status: true, data: cats});
  })
  .catch(err => {
    console.log(err);
  })
};


exports.getCategoryMoreNews = function (req, res) {
  const {category, page} = req.query;

  const params = {
    limit: NEWS_COUNT,
    offset: page * NEWS_COUNT,
    order: [
      ['datetime', 'DESC']
    ],
    where: {id_category : category},
    include: [ Source, Category],
  };
  News.findAll(params)
  .then(news => {
    const data = { id: category, news: news, end: news.length < NEWS_COUNT};
    res.send({status: true, data});

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

