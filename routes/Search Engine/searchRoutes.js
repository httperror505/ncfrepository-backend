const express = require('express');
const router = express.Router();

const fuseController = require('./../../controllers/fuseSearch');
const fuzzballController = require('./../../controllers/fuzzballSearch');
const LevenshteinController = require('./../../controllers/Levenshtein');
const fuzzySearchController = require('./../../controllers/fuzzySearch');
const ManualAlgorithmController = require('./../../controllers/manualAlgorithm');

// Authors, keywords, and institutions
const authorsController = require('./../../controllers/authorSearch');
const keywordsController = require('./../../controllers/keywordSearch');
const categoriesController = require('./../../controllers/categorySearch');

router.post('/fuse', fuseController.fuseSearch);
router.post('/fuzzball', fuzzballController.fuzzballSearch);
router.post('/levenshtein', LevenshteinController.Levenshtein);
router.post('/fuzzy', fuzzySearchController.fuzzySearch);
router.post('/manual', ManualAlgorithmController.ManualAlgorithm);

// Authors, keywords, and institutions
router.post('/authors', authorsController.authorSearch);
router.post('/keywords', keywordsController.keywordSearch);
router.post('/categories', categoriesController.categorySearch);

module.exports = router;