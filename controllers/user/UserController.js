const getSiteData = require('../../functions/getSiteData');
const getToday = require('../../functions/getToday');
const editUserData = require('../../functions/editUserData');

const db = require('../../config/db');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(db.name, db.user, db.password, db.config);


/** Import models */
const News = sequelize.import('../../models/news');
const Source = sequelize.import('../../models/sources');
const Category = sequelize.import('../../models/categories');
const User = sequelize.import('../../models/users');

News.belongsTo(Source, {foreignKey: 'id_source'});
News.belongsTo(Category, {foreignKey: 'id_category'});

exports.profile = function(req, res) {

  User.findById(req.user.id)
  .then(user => {
    let responseData = {
      isAuth: req.isAuthenticated(),
      profile: true,
      is_dark_theme: parseInt(user.is_dark_theme) === 1
    };

    console.log('>> DARK THEME', responseData.is_dark_theme);

    const currentUserViews = req.user.views? req.user.views.split(',').filter( v => parseInt(v)).map( e => parseInt(e)) : [];
    const currentUserLikes = req.user.likes? req.user.likes.split(',').filter( l => parseInt(l)).map( e => parseInt(e)) : [];

    const history = [];

    getSiteData()
      .then(data => {
        const day = req.user.summary_news_day;

        responseData.siteData = data;
        responseData.user = req.user;
        responseData.user.dayArray = {
          day1: day === 1,
          day2: day === 2,
          day3: day === 3,
          day4: day === 4,
          day5: day === 5,
          day6: day === 6,
          day7: day === 7,
        };

        return News.findAll({
          where:{
            id: currentUserViews
          },
          include: [ Source, Category],
          order: [
            ['id', 'desc']
          ],
        })
      })
      .then( news => {

        const temp = {};

        news.forEach( n => {
          if(currentUserLikes.includes(n.id)){
            n.interesting = true;
          }
          temp[n.id] = n;
          // history.push(obj);
        });

        currentUserViews.reverse();

        currentUserViews.forEach( v => {
          history.push(temp[v]);
        });

        responseData.news = history;
        res.render('user/profile', responseData);
      });
  })


};

exports.profileEdit = function(req, res) {

  let responseData = {
    isAuth: req.isAuthenticated(),
    profile: true,
    // is_dark_theme: parseInt(user.is_dark_theme) === 1
  };

  console.log(req.body);

  editUserData(req.body, req.user.id)
  .then(user =>{
    res.redirect('/user/profile');

  })
};

exports.getFriends = function (req, res) {


  const currentUserViews = req.user.views ? req.user.views.split(',').filter( v => parseInt(v)) : [];
  const currentUserLikes = req.user.likes ? req.user.likes.split(',').filter( l => parseInt(l)) : [];
  const currentUserFriends = req.user.friends ? req.user.friends.split(',').filter( f => parseInt(f)) : [];


  // похожие пользователи
  let sameUsers = {};
  let sameUsersArray = [];
  let sameUsersHistories = [];

  News.findAll({
    where:{
      id: currentUserViews
    }
  })
  .then( viewedNews => {

    // новости, которые были просмотрены текущим пользователем
    viewedNews.forEach( n => {

      // пользователи, которые смотрели/лайкали новость, которую смотрел текущий пользователь
      const users_views = n.users.split(',').filter( u => parseInt(u) && parseInt(u) !== req.user.id);
      const users_likes = n.likes ? n.likes.split(',').filter( u => parseInt(u) && parseInt(u) !== req.user.id): [];

      // оценка для пользователя - если смотрел, что смотрел текущий юзер = 1
      // - если лайкал, что смотрел текущий юзер = 2 (value +1)
      // - если смотрел, что лайкал текущий юзер = 3
      // - если лайкал, что лайкал текущий юзер = 4 (value + 1)

      const value = currentUserLikes.includes(n.id) ? 3 : 1;

      // устанавливаем/накапливаем оценку для пользователей
      users_views.forEach( u => {
        // если пользователь уже друг текущего пользователя - не добавляем его
        if(!currentUserFriends.includes(u))
          sameUsers[u] = sameUsers[u] ? sameUsers[u]+value : value;
      });

      users_likes.forEach( u => {
        if(!currentUserFriends.includes(u))
          sameUsers[u] = sameUsers[u] ? sameUsers[u]+value+1 : value+1;
      });
    });

    sameUsers = normalize(sameUsers);

    for(let key in sameUsers){
      sameUsersArray.push({id: key, weight: sameUsers[key]});
    }

    sameUsersArray.sort((a,b)=>{
      if(a.weight > b.weight)
        return -1;
      if(a.weight < b.weight)
        return 1;
      return 0;
    });

    sameUsersArray = sameUsersArray.slice(0, 13);

    return User.findAll({where:{ id: sameUsersArray.map( obj => obj.id) }})
  })
  .then(users => {

    let promises = [];

    sameUsersArray.forEach(s =>{

      promises.push(new Promise((resolve, reject) => {

        // console.log('S ', s);

        // console.log(users.map(u => u.id).join(', '));

        const user = users.filter( u => u.id === parseInt(s.id))[0];

        let sameUserHistory = { id: s.id, similarity: s.weight, name: user.name, color: user.color};
        let sameHistory = [];

        const userViews = user.views? user.views.split(',').filter( v => parseInt(v)).map( e => parseInt(e)) : [];
        const userLikes = user.likes? user.likes.split(',').filter( l => parseInt(l)).map( e => parseInt(e)) : [];


        News.findAll({
          where:{
            id: userViews
          },
          include: [ Source, Category],
          order: [
            ['id', 'desc']
          ],
        })
        .then(news => {

          const temp = {};

          news.forEach( n => {
            let tempNews = {};
            if(userLikes.includes(n.id)){
              tempNews.interesting = true;
            }
            temp[n.id] = {...tempNews, title: n.title, id: n.id, description: n.description, image: n.image};
          });

          userViews.reverse();

          userViews.forEach( v => {
            sameHistory.push(temp[v]);
          });

          resolve({...sameUserHistory, history: sameHistory});
        });

      }));

    });

    return Promise.all(promises)
  })
  .then((data) => {

    res.send({status: true, data});
  })
  .catch(err => {
    console.log(err);
  });



};

exports.getMyFriends = function (req, res) {

  const currentUserFriends = req.user.friends ? req.user.friends.split(',').filter( f => parseInt(f)) : [];

  // похожие пользователи
  let sameUsers = {};
  let sameUsersArray = [];
  let sameUsersHistories = [];

  User.findAll({where:{ id: currentUserFriends }})
    .then(users => {

      let promises = [];

      users.forEach(user =>{

        promises.push(new Promise((resolve, reject) => {

          let sameUserHistory = { id: user.id, name: user.name, color: user.color};
          let sameHistory = [];

          const userViews = user.views? user.views.split(',').filter( v => parseInt(v)).map( e => parseInt(e)) : [];
          const userLikes = user.likes? user.likes.split(',').filter( l => parseInt(l)).map( e => parseInt(e)) : [];


          News.findAll({
            where:{
              id: userViews
            },
            include: [ Source, Category],
            order: [
              ['id', 'desc']
            ],
          })
            .then(news => {

              const temp = {};

              news.forEach( n => {
                let tempNews = {};
                if(userLikes.includes(n.id)){
                  tempNews.interesting = true;
                }
                temp[n.id] = {...tempNews, title: n.title, id: n.id, description: n.description, image: n.image};
              });

              userViews.reverse();

              userViews.forEach( v => {
                sameHistory.push(temp[v]);
              });

              resolve({...sameUserHistory, history: sameHistory});
            });

        }));

      });

      return Promise.all(promises)
    })
    .then((data) => {

      res.send({status: true, data});
    })
    .catch(err => {
      console.log(err);
    });
};

exports.acceptFriend = function (req, res) {
  const{friend} = req.body;

  User.findById(req.user.id)
  .then(user => {
    user.friends = user.friends ? user.friends + `${friend},` : `${friend},`;
    return user.save();
  })
  .then(user => {
    res.send({status: true});
  })
  .catch(err => {
    console.log(err);
  })
};

function normalize(object) {
  // максимальный вес
  const max = Math.max.apply(null, Object.values(object)) + 1;
  const min = Math.min.apply(null, Object.values(object));

  for(let key in object){
      object[key] = (object[key])/ (max);
  }
  return object;
}