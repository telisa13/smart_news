const request = require('request');
const parseXML = require('xml2js').parseString;
const Sequelize = require('sequelize');
const replaceChars = require('../replaceChars');

// convert windows1251 to utf8
// const iconv = require('iconv-lite');

const db = require('../../config/db');
const howToRead = require('../howToRead');
const randomImage = require('../randomImage');
const replaceTags = require('../replaceTags');

const sequelize = new Sequelize(db.name, db.user, db.password, db.config);
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

      resolve(body);
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
    const clearTitle = replaceChars(one.title[0]);

    const clearDescription = replaceChars(replaceTags(one.description[0])).trim();
    const rightDatetime = new Date(one.pubDate[0]).toLocaleString();
    // const titleTags = one.title[0].split(' ');
    const titleTags = [one.category[0]];
    const body = one['yandex:full-text'].toString();
    const read = howToRead(body);


    // get src from img tag
    const regex = /<img.*?src="(.*?)"/;
    const imageUrl = regex.exec(one.image[0])[1].trim();


    /** select EXISTED tags (id) */
    const promises = titleTags.map(t => {
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
      dbTags = dbTags.filter(t => t );

      return News.findOrCreate({
        defaults: {
          title: clearTitle,
          // title: one.title[0],
          description: clearDescription,
          datetime: rightDatetime,
          link: one.link[0],
          image: imageUrl,
          body,
          read,
          id_category,
          id_source
        },
        where : { title: clearTitle }
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

