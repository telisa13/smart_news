const express = require('express');
const router = express.Router();
const controller = require('../controllers/search/SearchController');

/* GET users listing. */
router.get('/get',  controller.popular);
router.get('/',  controller.search);

module.exports = router;
