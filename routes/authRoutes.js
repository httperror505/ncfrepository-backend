const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database/db');
const {authenticateToken} = require('../authentication/middleware');

const router = express.Router();

// login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const getUserQuery = 'SELECT * FROM user WHERE email = ?';
        const [rows] = await db.promise().execute(getUserQuery, [email]);

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid ID number or password' });
        }
        const user = rows[0];
        
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid ID number or password' });
        }

        const token = jwt.sign({ userId: user.user_id, email: user.email, name: user.name, roleId: user.role_id }, process.env.SECRET_KEY, { expiresIn: '1h' });

        res.status(200).json({ token, userId: user.user_id });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


module.exports = router;