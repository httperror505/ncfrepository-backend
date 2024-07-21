const express = require('express');
const router = express.Router();

const fuseController = require('../controllers/fuseSearch');
const fuzzballController = require('../controllers/fuzzballSearch');
const LevenshteinController = require('../controllers/Levenshtein');
const fuzzySearchController = require('../controllers/fuzzySearch');

router.post('/fuse', fuseController.fuseSearch);
router.post('/fuzzball', fuzzballController.fuzzballSearch);
router.post('/levenshtein', LevenshteinController.Levenshtein);
router.post('/fuzzy', fuzzySearchController.fuzzySearch);

module.exports = router;