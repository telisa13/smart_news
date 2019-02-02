const request = require('request');
const parseXML = require('xml2js').parseString;
const Sequelize = require('sequelize');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const db = require('../../config/db');
const howToRead = require('../howToRead');

const replaceTags = require('../replaceTags');

const sequelize = new Sequelize(db.name, db.user, db.password, db.config);
const RssUrl = sequelize.import('../../models/rss_urls');
const Source = sequelize.import('../../models/sources');
const Category = sequelize.import('../../models/categories');
const News = sequelize.import('../../models/news');
const Tag = sequelize.import('../../models/tags');

/** many-to-many */
Tag.belongsToMany(News, {through: 'news_tags', foreignKey: 'id_tag'});
News.belongsToMany(Tag, {through: 'news_tags', foreignKey: 'id_news'});


module.exports = function (rssItem) {
  const link = rssItem.url;
  const id_category = rssItem.id_category;
  const id_source = rssItem.id_source;

  new Promise((resolve, reject)=>{
    request(link, (err, response, body)=>{
      if(err) reject(err);

      // console.log('Status code: ' + response.statusCode);
      resolve(body);
    });
  }).then(body => {
    return new Promise((resolve, reject)=>{
      parseXML(body, (err, result)=>{
        if(err) reject(err);
        resolve(result);
      })
    })
  }).then(json =>{

    json.rss.channel[0].item.forEach(n=>processOneNews(n, id_category, id_source));
    // processOneNews(json.rss.channel[0].item[0], id_category, id_source);
  }).catch((promiseError)=>{
    console.log(promiseError);
  });

  function processOneNews(one, id_category, id_source) {

    const Op = Sequelize.Op;

    const clearDescription = replaceTags(one.description[0]);
    const rightDatetime = new Date(one.pubDate[0]).toLocaleString();
    const tags = one['orgsource:tags'].toString().split(', ');
    const read = howToRead(one.fulltext[0]);

    // get src from img tag
    const regex = /<img.*?src="(.*?)"/;
    const imageUrl = regex.exec(one.image[0])[1];

    /** Insert or select tags (id) */
    const promises = tags.map(t=> {
      return Tag.findOrCreate({
        where: {
          name: t
        }
      }).spread((dbTag, created)=>{
        return dbTag;
      }).catch(err=>{
        console.log(err);
      });
    });

    Promise.all(promises).then(dbTags => {
      return News.findOrCreate({
        defaults: {
          title: one.title[0],
          description: clearDescription,
          datetime: rightDatetime,
          link: one.link[0],
          image: imageUrl,
          body: one.fulltext[0],
          id_category,
          id_source,
          read
        },
        where : { title: one.title[0] }
      }).spread((dbNews, created)=>{

        // новость уже есть в БД
        if(!created) return;

        /** many-to-many */
        dbNews.addTags(dbTags).then(()=>console.log(`Added: ${dbNews.id} at ${new Date().toLocaleString()}`));
      })
    }).catch(err=>{
      console.log(`FAILED TO ADD NEWS: ${one.link[0]}`);
    });
  }
};

