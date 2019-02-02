const db = require('../config/db');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(db.name, db.user, db.password, db.config);

const moment = require('moment');
moment.locale('ru');

/** Import models */
const News = sequelize.import('../models/news');
const Source = sequelize.import('../models/sources');
News.belongsTo(Source, {foreignKey: 'id_source'});

module.exports = ()=>{
  const Op = Sequelize.Op;
  const mNow = moment().subtract(7, 'days');

  return new Promise((resolve, reject)=>{
    News.findOne({
      order: [
        ['views', 'DESC']
      ],
      include: [ Source],
      attributes:['id', 'title', 'description', 'datetime', 'views', 'read', 'image', 'is_good'],
      where:{
        datetime:{
          [Op.gte]:mNow.format('YYYY-MM-DD')
        }
      }
    })
    .then( popNews=>{
      const dt = new Date(popNews.datetime);
      popNews.valDatetime = dt.toLocaleString();
      const momentDt = moment(dt);

      popNews.strDatetime = momentDt.format("MMM Do YY");
      resolve(popNews);
    }).catch(err=> console.log("FAILED to GET POP NEWS \n", err)  );
  });




};