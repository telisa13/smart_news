const db = require('../config/db');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(db.name, db.user, db.password, db.config);


/** Import models */
const Site = sequelize.import('../models/site');
module.exports = ()=>{

  return new Promise((resolve, reject)=>{
    Site.findById(1).then((model)=>{
      if(!model){
        reject()
      }
      const dt = new Date();
      let month = dt.getMonth()+1;
      let min = dt.getMinutes();
      resolve({
        // time: dt.toLocaleTimeString(),
        time: `${dt.getHours()} : ${min< 10 ? `0${min}` :  min}`,
        date: `${dt.getDate()}-${month< 10 ? `0${month}` : month}-${dt.getFullYear()}`,
        temp: parseInt(model.temp),
        usd: parseFloat(model.usd)
      });
    }).catch(err=> console.log("FAILED to GET SITE DATA \n", err)  );
  });

};