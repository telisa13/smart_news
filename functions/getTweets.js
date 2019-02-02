const db = require('../config/db');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(db.name, db.user, db.password, db.config);

const moment = require('moment');
moment.locale('ru');

/** Import models */
const President = sequelize.import('../models/presidents');
const Tweet = sequelize.import('../models/tweets');
Tweet.belongsTo(President, {foreignKey: 'id_president'});

module.exports = ()=>{
  const Op = Sequelize.Op;

  return new Promise((resolve, reject)=>{
    Tweet.findAll({
      order: [
        ['datetime', 'DESC']
      ],
      include: [ President],
      limit: 5,
    })
    .then( tweets => {
      Array.from(tweets).forEach(t=>{
        const dt = new Date(t.datetime);
        t.valDatetime = dt.toLocaleString();
        const momentDt = moment(dt);
        t.strDatetime = momentDt.fromNow();
      });

      resolve(tweets);
    }).catch(err=> console.log("FAILED to GET TWEETS \n", err)  );
  });




};