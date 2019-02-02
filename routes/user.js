const express = require('express');
const router = express.Router();
const userController = require('../controllers/user/UserController');
const authController = require('../controllers/auth/AuthController');

/* GET user profile. */
router.get('/profile', authController.isLoggedIn, userController.profile);

/* POST user data (edit). */

router.post('/profile', authController.isLoggedIn, userController.profileEdit);

router.post('/friends', userController.getFriends);
router.post('/friends/accept', userController.acceptFriend);
router.post('/friends/my', userController.getMyFriends);

module.exports = router;
