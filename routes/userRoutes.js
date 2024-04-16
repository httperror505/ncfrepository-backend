const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database/db');
const {authenticateToken, isAdmin, isNCFUser, isNotNCFUser } = require('../authentication/middleware');

const router = express.Router();

router.post('/register', async (req, res) => {
    try {

        const { name, email, password, role_id } = req.body;

        if (!name || !email || !password || !role_id) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // password strength validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ error: 'Password must be 8-15 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character' });
        }

        // check if user with the same name or ID number already exists
        const checkUserByNameQuery = 'SELECT * FROM user WHERE name = ?';
        const [existingUserByNameRows] = await db.promise().execute(checkUserByNameQuery, [name]);

        if (existingUserByNameRows.length > 0) {
            return res.status(409).json({ error: 'User with this name already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const insertUserQuery = 'INSERT INTO user(name, email, password, role_id) VALUES (?, ?, ?, ?)';
        await db.promise().execute(insertUserQuery, [name, email, hashedPassword, role_id]);
        
        res.status(201).json({ message: 'User Registered Successfully' });

    } catch (err) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'User Registration Endpoint Error!' });
    }
});


router.get('/users/all', authenticateToken, async(req, res) =>{

    try {
        const getAllUsersQuery = 'SELECT u.user_id, u.email, u.name, u.role_id, r.role_name FROM user u JOIN role r ON u.role_id = r.role_id';
        const [rows] = await db.promise().execute(getAllUsersQuery);

        res.status(200).json({ users: rows });
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// update user by id
router.put('/:user_id', async (req, res) =>{

    try{

        const userId = req.params.user_id;
        const { name, email, password } = req.body;

        const getUserQuery = 'SELECT u.user_id, u.email, u.name, u.role_id, r.role_name FROM user u JOIN role r ON u.role_id = r.role_id WHERE u.user_id = ?';
        const [userRows] = await db.promise().execute(getUserQuery, [userId]);

        if(userRows.length === 0){
            return res.status(404).json({error: 'User not found'});
        }

        const user = userRows[0];
        const hashedPassword = await bcrypt.hash(password, 10);
        const updateUserQuery = 'UPDATE user SET name = ?, email = ?, password = ? WHERE user_id = ?';
        await db.promise().execute(updateUserQuery, [name, email, hashedPassword, userId]);

        const updatedUser = { ...user, id_number, name, is_active, role_name: user.role_name };
        res.status(200).json({ message: 'User updated successfully', user: updatedUser });

    }
    
    catch(error){
        console.error('Error updating user:', error);
        res.status(500).json({error: 'User Update Endpoint Error!'});
    }
});

module.exports = router;