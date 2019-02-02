const db = require('../config/db');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(db.name, db.user, db.password, db.config);


/** Import models */
const User = sequelize.import('../models/users');

module.exports = (input, id)=>{
  // console.log(input);
  return new Promise((resolve, reject)=>{
    User.findById(id)
    .then(user => {
      return user.update(input)
    })
    .then(updatedUser=>{
      resolve(updatedUser);
    })
    .catch(err=> console.log("FAILED to EDIT USER DATA \n", err)  );
  });
};