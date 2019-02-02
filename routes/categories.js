const express = require('express');
const router = express.Router();
const categories = require('../controllers/categories');

/* GET user profile. */
router.get('/', categories.getPage);

/* POST user data (edit). */

router.post('/', categories.getNews);

router.post('/more', categories.getCategoryMoreNews);

module.exports = router;
