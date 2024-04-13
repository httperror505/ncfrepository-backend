const express = require('express');
const router = express.Router();

const fuseController = require('../controllers/fuseSearch');
const fuzzballController = require('../controllers/fuzzballSearch');

router.post('/fuse', fuseController.fuseSearch);
router.post('/fuzzball', fuzzballController.fuzzballSearch);

module.exports = router;