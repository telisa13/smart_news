const express = require('express');
const router = express.Router();
const controller = require('../controllers/newsPage');

/* GET news page. */
router.get('/:id',  controller.getPage);
router.get('/one/:id',  controller.getNews);
router.get('/one/:id/recommended',  controller.getRecommendedNews);
router.post('/one/:id',  controller.likeNews);
router.post('/share/:id',  controller.shareNews);



module.exports = router;
