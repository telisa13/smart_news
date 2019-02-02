const express = require('express');
const passport = require('passport');
const router = express.Router();
const authController = require('../controllers/auth/AuthController');

/* GET login & registration page */
router.get('/', authController.login);

router.post('/register', passport.authenticate('local-register', {
    successRedirect: '/user/profile',
    failureRedirect: '/auth',
    failureFlash : true
  }
));

/* GET login page */
// router.get('/login', authController.login);
router.post('/login', passport.authenticate('local-login', {
    successRedirect: '/user/profile',
    failureRedirect: '/auth'
  }
));

/* GET logout page */
router.get('/logout', authController.logout);

module.exports = router;
