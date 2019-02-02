const db = require('../config/db');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(db.name, db.user, db.password, db.config);


/** Import models */
const NewsTags = sequelize.import('../models/news_tags');

module.exports = (user)=>{

  let myTags = processTags(user.tags.split(','));
  const newsWithWeight = {};


  return new Promise((resolve, reject) => {

    NewsTags.findAll({
      where:{
        id_tag: Object.keys(myTags)
      }
    })
    .then(newsTags => {


      const viewedNews = user.views.split(',').filter( e => parseInt(e));

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

      resolve(newsWithWeight);
    })
    .catch(err => {
      reject(err);
    })

  });
};

// возвращает объект:
// ключ - ид тега,
// значние - кол-во повторений тега
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