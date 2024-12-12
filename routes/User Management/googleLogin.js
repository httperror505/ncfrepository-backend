const express = require('express');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const db = require('../../database/db');
require("dotenv").config();

const router = express.Router();
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const JWT_SECRET = process.env.SECRET_KEY;

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

router.post('/google-login', async (req, res) => {
  const { id_token } = req.body;

  try {
    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;

    // Check if the user already exists in the database
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];

    if (user) {
      // User exists, generate JWT token
      const accessToken = jwt.sign(
        { userId: user.user_id, name: user.name, email: user.email, roleId: user.role_id },
        PRoT,
        { expiresIn: '1h' }
      ); 

      // Return response with the token and user info
      return res.status(200).json({
        token: accessToken,
        userId: user.user_id,
        roleId: user.role_id,
        userExists: true, // Indicate that the user already exists
      });
    } else {
      // User does not exist, do not insert yet. Just return userExists flag.
      return res.status(200).json({
        userExists: false, // Indicate that the user does not exist
        email,
        name,
      });
    }
  } catch (error) {
    console.error('Error during Google login:', error.message);

    // Return a more specific error message based on the error
    return res.status(401).json({
      error: error.message || 'Invalid Google token or error processing request'
    });
  }
});

module.exports = router;