const getSiteData = require('../../functions/getSiteData');
const getToday = require('../../functions/getToday');

exports.login = function(req, res, next) {

  let responseData = {
    isAuth: req.isAuthenticated(),
    login: true,
    is_dark_theme: req.isAuthenticated() ? req.user.is_dark_theme : false

  };
  getSiteData()
    .then(data => {
      responseData.siteData = data;
      return getToday()
    })

    /* today events */
    .then(events => {
      responseData.events = events;
      responseData.message = req.flash('message')[0];
      res.render('auth/index', responseData);
    });



};