const express = require("express");
const { google } = require("googleapis");
const multer = require("multer");
const { Readable } = require('stream');
const fs = require("fs");
const path = require("path");
const db = require("./../../database/db");
const loadDocuments = require("./../../config/cache");


const router = express.Router();


const googleServiceAccount = {
  type: "service_account",
  project_id: "ccsrepository-444308",
  private_key_id: "ad95bb0e9b7b40f9b43b2dd9dc33cc3eb925bce9",
  private_key: `-----BEGIN PRIVATE KEY-----
MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDVgISVob0EV2BE
T0NXxB6R/TCLwgZzGG3ivK7uzoIJoGQPKLSkABLu0/3GNdwMx4ZEOOsEr+EMyUhp
8LMj9iik9mOyb+R4kEDAEQlQZ0+HvK/Yabm67umX/6dGRv7JCC+yNRP28XQ9GuOU
SmmhEqnmmga2lWp+mPBl6W6nX7gOAIj6xtugYU1IRAIZ0Yxs8eVTp5y4mh7sWqko
xXUmkSCcLY6Wm1zlR8yHTExSL/QPmnWUNyOqyIg6bvRq3nAwYdGLUZRoTa1TWnQO
ewqa1GM9aouAI0d+RsCw//UEG2V4v+kxkso21dB9YmmKbSnyRairNr2IIeyNrPWL
NZShI6UHAgMBAAECggEAEXK2CY2ujYiS5yvV7fn3ogIS/q2/hC/Zzx73ahaTXWdv
tfNwK9T1UL8fbRyHgr3aaBnn6KBAOdP7TuxRksQYinHrMBdH3ZIaA8UaQalnwC9e
uZN0wjIQAhC6rwCFuV0pzk90woiO2AcqB4ghsMmxlXulLJryZi0073ppXu4jwKg+
H9vdUlzNYUUHJVvHWIiv+ITN43Xx0EYRIe6n5e/ZeZ4hAFqtmqzb+rSOXgmgqIMw
oGBW/OZbvlkJsGWHyGZeZSLL+iJXNDJDk8YFv3arpbInBk3OYQk9UPYY82l3f1au
DlWtL389kSgyJ/Gfvr30qDhs1WEN5Te2//HZu5l7YQKBgQDrH5WbxHJzk/Hc1jpK
JQmUlB2t26Cv+/+fOzAz5KHgFX2RLjXIHl5iufib3HM+nbUOe66As7U0r7/Va0Nn
1qppy05HL4ZzA36bsQ8Fw5prdVQjjU+r4c1wEaY8O13ckzL6qKZIOGNEuBF0vRoq
zGxN8iYsZ3MW6JX7E3zK/FvpYQKBgQDodXl5CJMw/67n6o/DlmnoxMdUNKXvyoxs
Udz/daKX682tGBLa06u1ZCCMCJYgahQwqRv15apTscOvy5sBQraz8H/UGc3v0AZ0
Dz5zyOaLw9pHv9C7MuDRhzd708Q3Z/Gh4YK6+syae6gposLh1wLqIbRUOTuCZGA6
RSFZ4qYfZwKBgQCczEZgR6Sv0RS1WiQrOAHolNIqFFJXqi0xSi5+HNWa85n2jKOP
HjmBi1Xw0xYDxvZsfyzDZZTNWvsKX2rnP7ALt2ovbNEzuDvhpjVHecdsLCV9RArC
rGXte8epWUniBEQ2BuxFM114AWyatlVR/1umq3qrmB2XRGposvlBAQRmYQKBgQCS
lwIzQSURESvLNC/Ut1WyY+UPROQfgytqY3Vp41TVWO4q6bN6K2Fs0ed0ZzXE2yBA
T2RCfMIcZU1x3oOxF9D/R/pUVrF3OUfYiIRpn5dDLA7KkDug0UTU3OAwRirGhdXq
r7sxDldYVAKHvwwGPwCnhPmi4zST1ZiZJl8Rv8vioQKBgQDOiy1z7ezJzgJSNoKz
ee5zOWdsSRkxHBKRtc1vbBIxEg+z+838+TxXf2EJhkOA11OQptLGZ41iziR41P6A
qZRp3lzXySc6REVOJI969AZSGovOFYPX6YguCb6X4wSuc/Avn+3AT/0bE6eMTAhX
FgTYhJbE4mHJCmVUxn1C+iUleg==\n-----END PRIVATE KEY-----`,
  client_email: "ccsrepo@ccsrepository-444308.iam.gserviceaccount.com",
  client_id: "103197742225204345135",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/ccsrepo%40ccsrepository-444308.iam.gserviceaccount.com",
  universe_domain: "googleapis.com",
};


const auth = new google.auth.GoogleAuth({
  credentials: googleServiceAccount,
  scopes: ["https://www.googleapis.com/auth/drive"],
});


const drive = google.drive({
  version: "v3",
  auth,
});




const upload = multer({ storage: multer.memoryStorage() });


const bufferToStream = (buffer) => {
  const readable = new Readable();
  readable.push(buffer);
  readable.push(null);
  return readable;
};


router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file || req.file.mimetype !== "application/pdf") {
      return res.status(400).json({ error: "Invalid file type, only PDFs are allowed!" });
    }


    const { title, authors, categories, keywords, abstract, uploader_id } = req.body;


    // Validate input fields
    if (!authors) return res.status(400).json({ error: "Authors are required!" });
    if (!categories) return res.status(400).json({ error: "Categories are required!" });
    if (!keywords) return res.status(400).json({ error: "Keywords are required!" });


    // Split authors into an array of objects containing author_name and email
    const authorList = authors
  ? authors.split(',').map(author => {
      // Match the format "name (email)"
      const match = author.match(/^(.+?)\s?\(([^)]+)\)$/); // Regex to capture name and email
      if (!match) {
        console.warn(`Invalid author format for: ${author}`);
        return null; // or handle however you'd like
      }
      const [, author_name, email] = match;
      return {
        author_name: author_name.trim(),
        email: email.trim()
      };
  }).filter(author => author !== null) // Remove any invalid entries
  : [];


    const categoryList = categories ? categories.split(',').map(name => name.trim()) : [];
    const keywordList = keywords ? keywords.split(',').map(name => name.trim()) : [];


    // Upload file to Google Drive
    const fileMetadata = {
      name: req.file.originalname, // Use the original file name
      parents: ["1z4LekckQJPlZbgduf5FjDQob3zmtAElc"], // Replace with your folder ID
    };
    const media = {
      mimeType: req.file.mimetype,
      body: bufferToStream(req.file.buffer),
    };


    const driveResponse = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: "id",
    });


    const fileId = driveResponse.data.id;


    // Validate uploader_id
    if (!uploader_id || isNaN(uploader_id)) {
      return res.status(400).json({ error: "Invalid uploader ID!" });
    }


    // Check the roleId of the uploader
    const [uploader] = await db.query("SELECT role_id FROM users WHERE user_id = ?", [uploader_id]);
    if (uploader.length === 0) {
      return res.status(404).json({ error: "Uploader not found!" });
    }


    const role_id = uploader[0].role_id;


    // Set the default status
    let status = role_id === 1 ? "approved" : "pending";


    // Check if title already exists
    const [existingDocument] = await db.query("SELECT title FROM researches WHERE title = ?", [title]);
    if (existingDocument.length > 0) {
      return res.status(409).json({ error: "Document with this title already exists!" });
    }


    // Insert research with the file ID from Google Drive
    const [result] = await db.query(
      "INSERT INTO researches (title, publish_date, abstract, filename, uploader_id, status, file_id) VALUES (?, NOW(), ?, ?, ?, ?, ?)",
      [title, abstract, req.file.originalname, uploader_id, status, fileId]  // Use req.file.originalname for filename
    );
   
    const researchId = result.insertId;


    // Insert authors into the authors table and associate with the research
    const insertAuthors = async (researchId, authors) => {
      for (const { author_name, email } of authors) {
        let [authorRecord] = await db.query('SELECT author_id FROM authors WHERE author_name = ? AND email = ?', [author_name, email]);
        if (authorRecord.length === 0) {
            const [result] = await db.query('INSERT INTO authors (author_name, email) VALUES (?, ?)', [author_name, email]);
            authorRecord = { author_id: result.insertId };
        } else {
            authorRecord = authorRecord[0];
        }
        await db.query('INSERT INTO research_authors (research_id, author_id) VALUES (?, ?)', [researchId, authorRecord.author_id]);
      }
    };


    await insertAuthors(researchId, authorList);


    // Insert categories
    const insertCategories = async (researchId, categories) => {
      for (const name of categories) {
          let [category] = await db.query('SELECT category_id FROM category WHERE category_name = ?', [name]);
          if (category.length === 0) {
              const [result] = await db.query('INSERT INTO category (category_name) VALUES (?)', [name]);
              category = { category_id: result.insertId };
          } else {
              category = category[0];
          }
          await db.query('INSERT INTO research_categories (research_id, category_id) VALUES (?, ?)', [researchId, category.category_id]);
      }
    };


    await insertCategories(researchId, categoryList);


    // Insert keywords
    const insertKeywords = async (researchId, keywords) => {
      for (const name of keywords) {
          let [keyword] = await db.query('SELECT keyword_id FROM keywords WHERE keyword_name = ?', [name]);
          if (keyword.length === 0) {
              const [result] = await db.query('INSERT INTO keywords (keyword_name) VALUES (?)', [name]);
              keyword = { keyword_id: result.insertId };
          } else {
              keyword = keyword[0];
          }
          await db.query('INSERT INTO research_keywords (research_id, keyword_id) VALUES (?, ?)', [researchId, keyword.keyword_id]);
      }
    };


    await insertKeywords(researchId, keywordList);


    res.status(201).json({ message: "Research uploaded successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred while uploading the research" });
  }
});


router.delete('/delete-research/:research_id', async (req, res) => {
  const research_id = req.params.research_id;


  if (!research_id) {
      return res.status(400).json({ message: 'Research ID is required.' });
  }


  try {
      // Delete research entry, cascading to related tables
      const [result] = await db.query("DELETE FROM researches WHERE research_id = ?", [research_id]);


      if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Research not found.' });
      }


      res.status(200).json({ message: 'Research and associated records deleted successfully!' });
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while deleting the research.' });
  }
});


router.get('/research/reload', async (req, res) => {

  try {
    loadDocuments.loadDocuments();
    
    console.log("Documents reloaded successfully!");
    res.status(200).json({ message: 'Documents reloaded successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while reloading documents.' });
  }
});

module.exports = router;