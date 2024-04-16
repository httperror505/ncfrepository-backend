const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database/db');
const {authenticateToken} = require('../authentication/middleware');

const router = express.Router();

router.post('/login', async(req, res) => {

    try {

    } catch {
        
    }
});

module.exports = router;