const express = require('express');
const router = express.Router();
const feed = require('../controllers/feed/FeedController');
const authController = require('../controllers/auth/AuthController');

/* GET user profile. */
router.get('/', authController.isLoggedIn, feed.getPage);

/* POST user data (edit). */

router.post('/', feed.getNews);
router.post('/shared', feed.getShared);

module.exports = router;
