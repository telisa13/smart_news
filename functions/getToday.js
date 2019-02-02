const db = require('../config/db');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(db.name, db.user, db.password, db.config);

const moment = require('moment');
moment.locale('ru');

/** Import models */
const Holiday = sequelize.import('../models/holidays');

module.exports = ()=>{
  const mNow = moment();
  console.log(">Holidays ", mNow.format('MM-DD'));

  return new Promise((resolve, reject)=>{
    Holiday.findOne({
      where:{
        date: mNow.format('MM-DD')
      }
    })
    .then( events => {
      if(events)
        resolve(events.holidays.split(';;'));
      else
        resolve(null)
    }).catch(err=> console.log("FAILED to GET TWEETS \n", err)  );
  });




};