const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../../database/db");
const {
  authenticateToken,
  isAdmin,
  isNCFUser,
  isNotNCFUser,
} = require("../../authentication/middleware");
const sgMail = require("@sendgrid/mail");

const router = express.Router();

// Register a User
router.post("/register", async (req, res) => {
  try {
    const {
      last_name,
      first_name,
      middle_name,
      suffix,
      email,
      password,
      role_id,
    } = req.body;

    if ((!last_name || !first_name || !email || !password || !role_id)) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let program_id = 1;

    // Password strength validation
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error:
          "Password must be 8-15 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      });
    }

    // Check if user with the same email already exists
    const checkUserByEmailQuery = "SELECT * FROM users WHERE email = ?";
    const [existingUserByEmailRows] = await db
      .promise()
      .execute(checkUserByEmailQuery, [email]);

    if (existingUserByEmailRows.length > 0) {
      console.log("User with this email already exists");
      return res
        .status(409)
        .json({ error: "User with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertUserQuery =
      "INSERT INTO users (last_name, first_name, middle_name, suffix, email, password, role_id, program_id) VALUES (?, ?, ?, ?, ?, ?, ? ,?)";
    await db
      .promise()
      .execute(insertUserQuery, [
        last_name,
        first_name,
        middle_name,
        suffix,
        email,
        hashedPassword,
        role_id,
        program_id,
      ]);

    res.status(201).json({ message: "User Registered Successfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "User Registration Endpoint Error!" });
  }
});

// Change the Password of a User
router.patch("/user/change-password", async (req, res) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  try {
    const { email, oldPassword, newPassword, sentOTP } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if user with the same email exists
    const checkUserQuery = "SELECT * FROM users WHERE email = ?";
    const [userRows] = await db.promise().execute(checkUserQuery, [email]);
    const user = userRows[0];

    // Get otp
    const getOtpQuery = "SELECT otp FROM users WHERE email = ?";
    const [otpRows] = await db.promise().execute(getOtpQuery, [email]);
    const otp = otpRows[0].otp;

    if (userRows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const passwordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Incorrect password" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatePasswordQuery = "UPDATE users SET password = ? WHERE email = ?";
    const clearOtpQuery = "UPDATE users SET otp = NULL WHERE email = ?";
    // Compare both OTP strings
    if (otp !== sentOTP) {
      return res.status(401).json({ error: "Incorrect OTP" });
    }
    // Update the password if the OTP is correct
    // const otpMatch = await bcrypt.compare(otp, sentOTP);
    // Compare both string OTP
    // const otpMatch = otp === sentOTP;
    // if (!otpMatch) {
    //   return res.status(401).json({ error: "Incorrect OTP" });
    // }
    await db.promise().execute(updatePasswordQuery, [hashedPassword, email]);
    // Clear the OTP
    await db.promise().execute(clearOtpQuery, [email]);
    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ error: "Password Change Endpoint Error!" });
  }
});

// router.patch("/user/change-password", async (req, res) => {
//   sgMail.setApiKey(process.env.SENDGRID_API_KEY);

//   try {
//     const { email, oldPassword, newPassword, sentOTP } = req.body;

//     if (!oldPassword || !newPassword || !sentOTP) {
//       return res.status(400).json({ error: "Missing required fields" });
//     }

//     // Check if user with the same email exists
//     const checkUserQuery = "SELECT * FROM users WHERE email = ?";
//     const [userRows] = await db.promise().execute(checkUserQuery, [email]);
//     if (userRows.length === 0) {
//       return res.status(404).json({ error: "User not found" });
//     }
//     const user = userRows[0];

//     // Get OTP from database
//     const getOtpQuery = "SELECT otp FROM users WHERE email = ?";
//     const [otpRows] = await db.promise().execute(getOtpQuery, [email]);
//     const otp = otpRows[0]?.otp;

//     // Early return if OTP is missing
//     if (!otp) {
//       return res.status(400).json({ error: "OTP not found" });
//     }

//     // Compare both OTP strings
//     if (otp !== sentOTP) {
//       return res.status(401).json({ error: "Incorrect OTP" });
//     }

//     // Check if old password is correct
//     const passwordMatch = await bcrypt.compare(oldPassword, user.password);
//     if (!passwordMatch) {
//       return res.status(401).json({ error: "Incorrect password" });
//     }

//     // Hash the new password and update the user's password
//     const hashedPassword = await bcrypt.hash(newPassword, 10);
//     const updatePasswordQuery = "UPDATE users SET password = ? WHERE email = ?";
//     await db.promise().execute(updatePasswordQuery, [hashedPassword, email]);

//     // Clear the OTP
//     const clearOtpQuery = "UPDATE users SET otp = NULL WHERE email = ?";
//     await db.promise().execute(clearOtpQuery, [email]);

//     res.status(200).json({ message: "Password changed successfully" });
//   } catch (error) {
//     console.error("Error changing password:", error);
//     res.status(500).json({ error: "Password Change Endpoint Error!" });
//   }
// });

// Otp sender
router.post("/otp/send-email", async (req, res) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const { email } = req.body;

  try {
    const otp = Math.floor(100000 + Math.random() * 900000);
    // const updateOtpQuery = "UPDATE users SET otp = ? WHERE email = ?";
    // await db.promise().execute(updateOtpQuery, [otp, email]);
    const msg = {
      to: email, // Change to your recipient
      from: "jrtolosa@gbox.ncf.edu.ph", // Change to your verified sender
      subject: "One-time Password for Email Verification",
      html: `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <div style="text-align: center; padding: 20px;">
        <img src="https://ncf.edu.ph/wp-content/uploads/2024/04/ncf_logo-300x300.png" alt="Research Nexus Logo" width="60" style="margin-bottom: 20px;" />
      </div>
      <p>It looks like you are trying to create an account using this email address. As an additional security measure, you are requested to enter the OTP code (one-time password) provided in this email.</p>
      <p>If you did not intend to log in to npm, please ignore this email.</p>
      <div style="padding: 10px 20px; background-color: #f2f2f2; border-radius: 4px; text-align: center; margin: 20px 0;">
        <p style="font-size: 18px; color: #333;">The OTP code is:</p>
        <p style="font-size: 24px; font-weight: bold; color: #333;">${otp}</p>
      </div>
      
      <p>If you have any questions or concerns, please feel free to <a href="https://ccs-research-repository.vercel.app/">visit out our official website.</a>.</p>

      <footer style="text-align: center; font-size: 12px; color: #777; margin-top: 30px;">
        <p>All rights reserved. NCF Research Nexus, Naga College Foundation.</p>
      </footer>
    </div>
  `,
    };
    sgMail
      .send(msg)
      .then(() => {
        console.log("OTP email sent");
        // Respond the otp to the client
        res.status(200).json({ otp });
      })
      .catch((error) => {
        console.error("Error sending OTP email:", error);
        res.status(500).json({ error: "SGMail Endpoint Error!" });
      });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ error: "OTP Email Endpoint Error!" });
  }
});

router.patch("/otp/change-password", async (req, res) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const { email } = req.body;

  try {
    // Send otp to confirm the password change
    const otp = Math.floor(100000 + Math.random() * 900000);
    const updateOtpQuery = "UPDATE users SET otp = ? WHERE email = ?";
    await db.promise().execute(updateOtpQuery, [otp, email]);
    const msg = {
      to: email, // Change to your recipient
      from: "ncfresearchnexus@gmail.com", // Change to your verified sender
      subject: "One-time Password for Password Reset",
      //   text: otp.toString(),
      //   html: "<strong>{otp}</strong>",
      text: `Your OTP is: ${otp}`,
      html: `<strong>Your OTP is: ${otp}</strong>`,
    };
    sgMail
      .send(msg)
      .then(() => {
        console.log("Email sent");
        res.status(200).json({ message: "OTP sent successfully" });
      })
      .catch((error) => {
        console.error(error);
      });
  } catch (error) {
    console.error("Error sending OTP for changing password:", error);
    res.status(500).json({ error: "OTP Password Change Endpoint Error!" });
  }
});

// Forgot password with otp sender
router.post("/forgot-password", async (req, res) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const checkUserQuery = "SELECT * FROM users WHERE email = ?";
    const [userRows] = await db.promise().execute(checkUserQuery, [email]);
    if (userRows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const user = userRows[0];
    const otp = Math.floor(100000 + Math.random() * 900000);
    const hashedOtp = await bcrypt.hash(otp.toString(), 10);
    const updateOtpQuery = "UPDATE users SET otp = ? WHERE user_id = ?";
    await db.promise().execute(updateOtpQuery, [otp, user.user_id]);
    // Sendgrid implementation
    const msg = {
      to: email, // Change to your recipient
      from: "jrtolosa@gbox.ncf.edu.ph", // Change to your verified sender
      subject: "One-time Password for Password Reset",
      //   text: otp.toString(),
      //   html: "<strong>{otp}</strong>",
      text: `Your OTP is: ${otp}`,
      html: `<strong>Your OTP is: ${otp}</strong>`,
    };
    sgMail
      .send(msg)
      .then(() => {
        console.log("Email sent");
        res.status(200).json({ message: "OTP sent successfully" });
      })
      .catch((error) => {
        console.error(error);
      });
    // Nodemailer
    // const transporter = nodemailer.createTransport({
    //     service: 'gmail',
    //     auth: {
    //         user: process.env.EMAIL,
    //         pass: process.env.PASSWORD
    //     }
    // });
    // const mailOptions = {
    //     from: process.env.EMAIL,
    //     to: email,
    //     subject: 'Forgot Password OTP',
    //     text: `Your OTP is: ${otp}`
    // };
    // transporter.sendMail(mailOptions, (error, info) => {
    //     if (error) {
    //         console.error('Error sending OTP email:', error);
    //         res.status(500).json({ error: 'Forgot Password OTP Email Error!' });
    //     } else {
    //         console.log('OTP email sent:', info.response);
    //         res.status(200).json({ message: 'OTP sent successfully' });
    //     }
    // });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ error: "Forgot Password Change Endpoint Error!" });
  }
});

router.get("/users/all", async (req, res) => {
  try {
    const getAllUsersQuery =
      "SELECT u.user_id, u.last_name, u.first_name, u.middle_name, u.suffix, u.email, u.role_id, u.password, r.role_name, p.program_name FROM users u JOIN roles r ON u.role_id = r.role_id LEFT JOIN program p ON u.program_id = p.program_id;";
    const [rows] = await db.promise().execute(getAllUsersQuery);

    res.status(200).json({ users: rows });
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/users/:user_id", async (req, res) => {
  try {
    const userId = req.params.user_id;

    if (!userId) {
      return res.status(400).json({ error: "Please provide user id" });
    }

    const getUserQuery =
      "SELECT u.user_id, u.last_name, u.first_name, u.middle_name, u.suffix, u.email, u.role_id, r.role_name, p.program_name FROM users u JOIN roles r ON u.role_id = r.role_id LEFT JOIN program p ON u.program_id = p.program_id WHERE u.user_id = ?";
    const [rows] = await db.promise().execute(getUserQuery, [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ user: rows[0] });
  } catch (error) {
    console.error("Error getting user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// update user by id
router.put("/:user_id", async (req, res) => {
  try {
    const userId = req.params.user_id;
    const { name, email, password } = req.body;

    const getUserQuery =
      "SELECT u.user_id, u.email, u.name, u.role_id, r.role_name FROM user u JOIN role r ON u.role_id = r.role_id WHERE u.user_id = ?";
    const [userRows] = await db.promise().execute(getUserQuery, [userId]);

    if (userRows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = userRows[0];
    const hashedPassword = await bcrypt.hash(password, 10);
    const updateUserQuery =
      "UPDATE user SET name = ?, email = ?, password = ? WHERE user_id = ?";
    await db
      .promise()
      .execute(updateUserQuery, [name, email, hashedPassword, userId]);

    const updatedUser = {
      ...user,
      id_number,
      name,
      is_active,
      role_name: user.role_name,
    };
    res
      .status(200)
      .json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "User Update Endpoint Error!" });
  }
});


module.exports = router;
