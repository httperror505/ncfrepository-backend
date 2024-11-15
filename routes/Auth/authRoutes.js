const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("./../../database/db");
const {
  authenticateToken,
  isAdmin,
  isNCFUser,
  isNotNCFUser,
} = require("./../../authentication/middleware");

const router = express.Router();

// login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const getUserQuery = 'SELECT * FROM users WHERE email = ?';
        const [rows] = await db.promise().execute(getUserQuery, [email]);

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid ID number or password' });
        }
        const user = rows[0];
        
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid ID number or password' });
        }

        const token = jwt.sign({ userId: user.user_id, email: user.email, lastName: user.last_name, firstName: user.first_name, roleId: user.role_id }, process.env.SECRET_KEY, { expiresIn: '1h' });

        res.status(200).json({ token, userId: user.user_id, roleId: user.role_id});
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


module.exports = router;