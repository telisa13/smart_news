
// exports.register = require('./RegisterController').register;
exports.login = require('./LoginController').login;
exports.logout = function (req, res) {
  req.session.destroy(function(err) {
    res.redirect('/');
  });
};

exports.isLoggedIn = function (req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/auth');
};