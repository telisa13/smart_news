const express = require('express');
const router = express.Router();
const controller = require('../controllers/index/IndexController');

/* GET users listing. */
router.get('/',  controller.getPage);
router.get('/news',  controller.getNews);

router.get('/strip',  controller.getStrip);

module.exports = router;
