const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        req.user = user;
        next();
    });
};

const isAdmin = (req, res, next) => {

    if (req.user.role_id === 1) {
       return next();
    } else {
        res.status(403).json({ error: 'Forbidden: ADMIN' });
    }
    
};

const isNCFUser = (req, res, next) => {
    if (req.user.role_id === 2) {
       return next();
    } else {
        res.status(403).json({ error: 'Forbidden: NCFUSER' });
    }
};

const isNotNCFUser = (req, res, next) => {
    if (req.user.role_id === 3) {
       return next();
    } else {
        res.status(403).json({ error: 'Forbidden: NOT NCFUSER' });
    }
};

module.exports = {authenticateToken, isAdmin, isNCFUser, isNotNCFUser};
