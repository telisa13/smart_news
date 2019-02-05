// const bCrypt = require('bcrypt');
const Sequelize = require('sequelize');
const db = require('../../config/db');

const sequelize = new Sequelize(db.name, db.user, db.password, db.config);
const User = sequelize.import('../../models/users');

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

module.exports = function (passport, user) {
  let User = user;
  let LocalStrategy = require('passport-local').Strategy;

  passport.use('local-register', new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true // allows us to pass back the entire request to the callback

    },
    function(req, email, password, done) {
      /** generate password hash function*/
      const generateHash = function(password) {
        return "";
        // return bCrypt.hashSync(password, bCrypt.genSaltSync(8));
      };

      const hashPassword = generateHash(password);

      const r = getRandomInt(0,256);
      const g = getRandomInt(0,256);
      const b = getRandomInt(0,256);


      const color = `rgba(${r},${g},${b},1)`;

      User.findOrCreate({
        defaults: {
          name: req.body.name,
          password: hashPassword,
          color
        },
        where : { email: email }
      }).spread((newUser, created)=>{
        /** user with this email is already exist */
        if(!created){
          return done(null, false,
            req.flash('message','Пользователь с данным email уже зарегестрирован')
            // {
            // message: 'Пользователь с данным email уже зарегестрирован'
          // }
          );
        }
        // if (newUser) {
          return done(null, newUser);
        // }
      });
    }

  ));


  passport.use('local-login', new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true // allows us to pass back the entire request to the callback
    },

    function(req, email, password, done) {

      const isValidPassword = function(userpass, password) {
        // return bCrypt.compareSync(password, userpass);
        return true;
      };

      User.findOne({
        where: {
          email: email
        }
      }).then(function(user) {

        if (!user) {
          return done(null, false, req.flash('message','Пользователь с данным email не зарегестрирован'));
        }

        if (!isValidPassword(user.password, password)) {
          return done(null, false, req.flash('message','Введён не верный пароль'));
        }
        const userinfo = user.get();
        return done(null, userinfo);


      }).catch(function(err) {
        console.log("Error:", err);

        return done(null, false, req.flash('message','Что-то пошло не так :('));

      });


    }

  ));



  //serialize
  passport.serializeUser(function(user, done) {

    done(null, user.id);

  });
  // deserialize user
  passport.deserializeUser(function(id, done) {

    User.findById(id).then(function(user) {

      if (user) {

        done(null, user.get());

      } else {

        done(user.errors, null);

      }

    });

  });
};