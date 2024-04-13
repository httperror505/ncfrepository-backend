const express = require('express');
const router = express.Router();

const controller = require('../controllers/searchQuery');

router.post('/fuse', controller.searchQuery);

module.exports = router;