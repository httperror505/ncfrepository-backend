const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database/db');
const {authenticateToken, isAdmin, isNCFUser, isNotNCFUser } = require('../authentication/middleware');
const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');

const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role_id, program_id} = req.body;

        if (!name || !email || !password || !role_id || !program_id) {  
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Password strength validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ error: 'Password must be 8-15 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character' });
        }

        // Check if user with the same email already exists
        const checkUserByEmailQuery = 'SELECT * FROM users WHERE email = ?';
        const [existingUserByEmailRows] = await db.promise().execute(checkUserByEmailQuery, [email]);

        if (existingUserByEmailRows.length > 0) {
            return res.status(409).json({ error: 'User with this email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const insertUserQuery = 'INSERT INTO users (name, email, password, role_id, program_id) VALUES (?, ?, ?, ?, ?)';
        await db.promise().execute(insertUserQuery, [name, email, hashedPassword, role_id, program_id]);

        res.status(201).json({ message: 'User Registered Successfully' });

    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'User Registration Endpoint Error!' });
    }
});


router.get('/users/all', async(req, res) =>{

    try {
        const getAllUsersQuery = 'SELECT u.user_id, u.name, u.email, u.role_id, r.role_name, p.program_name FROM users u JOIN roles r ON u.role_id = r.role_id LEFT JOIN program p ON u.program_id = p.program_id;';
        const [rows] = await db.promise().execute(getAllUsersQuery);

        res.status(200).json({ users: rows });
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/users/:user_id', async(req, res) =>{

    try {
        const userId = req.params.user_id;

        if (!userId) {
            return res.status(400).json({ error: 'Please provide user id' });
        }

        const getUserQuery = 'SELECT u.user_id, u.name, u.email, u.role_id, r.role_name, p.program_name FROM users u JOIN roles r ON u.role_id = r.role_id LEFT JOIN program p ON u.program_id = p.program_id WHERE u.user_id = ?';
        const [rows] = await db.promise().execute(getUserQuery, [userId]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ user: rows[0] });
    } catch (error) {
        console.error('Error getting user:', error);
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

// update user password

// Forgot password with otp sender
// Forgot password with otp sender
// router.post('/forgot-password', async (req, res) => {
//     try {
//         const { email } = req.body;

//         if (!email) {
//             return res.status(400).json({ error: 'Missing required fields' });
//         }

//         const checkUserQuery = 'SELECT * FROM users WHERE email = ?';
//         const [userRows] = await db.promise().execute(checkUserQuery, [email]);

//         if (userRows.length === 0) {
//             return res.status(404).json({ error: 'User not found' });
//         }

//         const user = userRows[0];
//         const otp = Math.floor(100000 + Math.random() * 900000);
//         const hashedOtp = await bcrypt.hash(otp.toString(), 10);

//         if (!user.user_id || !hashedOtp) {
//             console.error('Error: Missing required parameters for SQL query.');
//             return res.status(500).json({ error: 'Internal Server Error' });
//         }

//         const updateOtpQuery = 'UPDATE users SET otp = ? WHERE user_id = ?';
//         await db.promise().execute(updateOtpQuery, [hashedOtp, user.user_id]);

//         if (!process.env.EMAIL || !process.env.PASSWORD) {
//             console.error('Error: Missing email credentials in environment variables.');
//             return res.status(500).json({ error: 'Internal Server Error' });
//         }

//         const transporter = nodemailer.createTransport({
//             service: 'gmail',
//             auth: {
//                 user: process.env.EMAIL,
//                 pass: process.env.PASSWORD
//             }
//         });

//         const mailOptions = {
//             from: process.env.EMAIL,
//             to: email,
//             subject: 'Forgot Password OTP',
//             text: `Your OTP is: ${otp}`
//         };

//         transporter.sendMail(mailOptions, (error, info) => {
//             if (error) {
//                 console.error('Error sending OTP email:', error);
//                 return res.status(500).json({ error: 'Forgot Password OTP Email Error!' });
//             } else {
//                 console.log('OTP email sent:', info.response);
//                 return res.status(200).json({ message: 'OTP sent successfully' });
//             }
//         });

//     } catch (error) {
//         console.error('Error changing password:', error);
//         return res.status(500).json({ error: 'Forgot Password Change Endpoint Error!' });
//     }
// });

// Forgot password with otp sender
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const checkUserQuery = 'SELECT * FROM users WHERE email = ?';
        const [userRows] = await db.promise().execute(checkUserQuery, [email]);

        if (userRows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = userRows[0];
        const otp = Math.floor(100000 + Math.random() * 900000);
        const hashedOtp = await bcrypt.hash(otp.toString(), 10);

        if (!user.user_id || !hashedOtp) {
            console.error('Error: Missing required parameters for SQL query.');
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        const updateOtpQuery = 'UPDATE users SET otp = ? WHERE user_id = ?';
        await db.promise().execute(updateOtpQuery, [hashedOtp, user.user_id]);

        if (!process.env.SENDGRID_API_KEY) {
            console.error('Error: Missing SendGrid API key in environment variables.');
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        const msg = {
            to: email,
            from: process.env.EMAIL,  // Verified sender email
            subject: 'Forgot Password OTP',
            text: `Your OTP is: ${otp}`,
        };

        sgMail.send(msg)
            .then(() => {
                console.log('OTP email sent');
                return res.status(200).json({ message: 'OTP sent successfully' });
            })
            .catch(error => {
                console.error('Error sending OTP email:', error);
                return res.status(500).json({ error: 'Forgot Password OTP Email Error!' });
            });

    } catch (error) {
        console.error('Error changing password:', error);
        return res.status(500).json({ error: 'Forgot Password Change Endpoint Error!' });
    }
});




module.exports = router;