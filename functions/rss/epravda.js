const request = require('request');
const parseXML = require('xml2js').parseString;
const Sequelize = require('sequelize');

// convert windows1251 to utf8
const iconv = require('iconv-lite');

const db = require('../../config/db');
const howToRead = require('../howToRead');
const randomImage = require('../randomImage');

const sequelize = new Sequelize(db.name, db.user, db.password, db.config);
// const RssUrl = sequelize.import('../../models/rss_urls');
// const Source = sequelize.import('../../models/sources');
// const Category = sequelize.import('../../models/categories');
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
    const options = {
      url: link,
      encoding: null
    };

    request(options, (err, response, body)=>{
      if(err) reject(err);

      // rss in xml (buffer)
      const str = iconv.decode(body, 'win1251');
      resolve(str);
    });
  }).then(body=>{
    return new Promise((resolve, reject)=>{
      parseXML(body, (err, result)=>{
        if(err) reject(err);
        resolve(result);
      })
    })
  }).then(json=>{
    // console.log(json.rss.channel[0].item[0]);


    json.rss.channel[0].item.forEach(n=>processOneNews(n, id_category, id_source));
    // processOneNews(json.rss.channel[0].item[0], id_category, id_source);
  }).catch((promiseError)=>{
    console.log(promiseError);
  });

  function processOneNews(one, id_category, id_source) {

    const Op = Sequelize.Op;

    const rightDatetime = new Date(one.pubDate[0]).toLocaleString();
    const titleTags = one.title[0].split(' ');
    const read = howToRead(one.fulltext[0]);
    // console.log(read);

    /** select tags (id) */
    const promises = titleTags.map(t=> {
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

      // remove undefined tags
      dbTags = dbTags.filter(t=> t );

      return News.findOrCreate({
        defaults: {
          title: one.title[0],
          description: one.description[0],
          datetime: rightDatetime,
          link: one.link[0],
          image: randomImage(id_category),
          body: one.fulltext[0],
          read,
          id_category,
          id_source
        },
        where : { title: one.title[0] }
      }).spread((dbNews, created)=>{
        if(!created) return;

        /** many-to-many */
        dbNews.addTags(dbTags).then(()=>console.log(`Added: ${dbNews.id} at ${new Date().toLocaleString()}`));
      })
    }).catch(err=>{
      // console.log(err);
      console.log(`FAILED TO ADD NEWS: ${one.link[0]}`);
    });
  }

};

