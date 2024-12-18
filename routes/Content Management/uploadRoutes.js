const express = require("express");
const db = require("./../../database/db");
const {
  authenticateToken,
  isAdmin,
  isNCFUser,
  isNotNCFUser,
} = require("./../../authentication/middleware");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const router = express.Router();

// Directory where files will be uploaded
const uploadDir = path.resolve(__dirname, "./uploads/documents");

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads with file filter
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type, only PDFs are allowed!"), false);
  }
};

const upload = multer({ storage, fileFilter });

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ error: "Invalid file type, only PDFs are allowed!" });
    }

    const { title, authors, categories, keywords, abstract, uploader_id } =
      req.body;
    const filename = req.file.filename;

    // Check if title already exists
    const [existingDocument] = await db
      .promise()
      .execute("SELECT title FROM researches WHERE title = ?", [title]);
    if (existingDocument.length > 0) {
      return res
        .status(409)
        .json({ error: "Document with this title already exists!" });
    }

    // Validate uploader_id (you may want to add more validation)
    if (!uploader_id || isNaN(uploader_id)) {
      return res.status(400).json({ error: "Invalid uploader ID!" });
    }

    // Check the roleId of the uploader
    const [uploader] = await db.query(
      "SELECT role_id FROM users WHERE user_id = ?",
      [uploader_id]
    );
    if (uploader.length === 0) {
      return res.status(404).json({ error: "Uploader not found!" });
    }

    const role_id = uploader[0].role_id;
    console.log("Uploader roleId:", role_id); // Debugging step to log the roleId

    // Set the default status
    let status = "pending";
    if (role_id === 1) {
      console.log("Uploader is Admin, setting status to approved"); // Debugging step
      status = "approved";
    } else {
      console.log("Uploader is not Admin, setting status to pending"); // Debugging step
    }

    // Insert research
    const [result] = await db
      .promise()
      .execute(
        "INSERT INTO researches (title, publish_date, abstract, filename, uploader_id) VALUES (?, NOW(), ?, ?, ?)",
        [title, abstract, filename, uploader_id]
      );
    const researchId = result.insertId;

    // Insert authors
    const insertAuthors = async (researchId, authors) => {
      const authorNames = authors.split(",").map((name) => name.trim());
      for (const name of authorNames) {
        let [author] = await db
          .promise()
          .execute("SELECT author_id FROM authors WHERE author_name = ?", [
            name,
          ]);
        if (author.length === 0) {
          const [result] = await db
            .promise()
            .execute("INSERT INTO authors (author_name) VALUES (?)", [name]);
          author = { author_id: result.insertId };
        } else {
          author = author[0];
        }
        await db
          .promise()
          .execute(
            "INSERT INTO research_authors (research_id, author_id) VALUES (?, ?)",
            [researchId, author.author_id]
          );
      }
    };

    await insertAuthors(researchId, authors);

    // Insert categories
    const insertCategories = async (researchId, categories) => {
      const categoryNames = categories.split(",").map((name) => name.trim());
      for (const name of categoryNames) {
        let [category] = await dbz
          .promise()
          .execute("SELECT category_id FROM category WHERE category_name = ?", [
            name,
          ]);
        if (category.length === 0) {
          const [result] = await db
            .promise()
            .execute("INSERT INTO category (category_name) VALUES (?)", [name]);
          category = { category_id: result.insertId };
        } else {
          category = category[0];
        }
        await db
          .promise()
          .execute(
            "INSERT INTO research_categories (research_id, category_id) VALUES (?, ?)",
            [researchId, category.category_id]
          );
      }
    };

    await insertCategories(researchId, categories);

    // Insert keywords
    const insertKeywords = async (researchId, keywords) => {
      const keywordNames = keywords.split(",").map((name) => name.trim());
      for (const name of keywordNames) {
        let [keyword] = await db
          .promise()
          .execute("SELECT keyword_id FROM keywords WHERE keyword_name = ?", [
            name,
          ]);
        if (keyword.length === 0) {
          const [result] = await db
            .promise()
            .execute("INSERT INTO keywords (keyword_name) VALUES (?)", [name]);
          keyword = { keyword_id: result.insertId };
        } else {
          keyword = keyword[0];
        }
        await db
          .promise()
          .execute(
            "INSERT INTO research_keywords (research_id, keyword_id) VALUES (?, ?)",
            [researchId, keyword.keyword_id]
          );
      }
    };

    await insertKeywords(researchId, keywords);

    res.status(201).json({ message: "Document Uploaded Successfully" });
  } catch (error) {
    console.error("Error Upload Document:", error);
    res.status(500).json({ error: "Upload Document Endpoint Error!" });
  }
});

// Add author
router.post("/add-author", async (req, res) => {
  try {
    const { author_name } = req.body;

    // Check if author already exists
    const [existingAuthor] = await db
      .promise()
      .execute("SELECT author_name FROM authors WHERE author_name = ?", [
        author_name,
      ]);
    if (existingAuthor.length > 0) {
      return res
        .status(409)
        .json({ error: "Author with this name already exists!" });
    }

    // Insert author
    const [result] = await db
      .promise()
      .execute("INSERT INTO authors (author_name) VALUES (?)", [author_name]);
    const authorId = result.insertId;

    res.status(201).json({ message: "Author Added Successfully", authorId });
  } catch (error) {
    console.error("Error Add Author:", error);
    res.status(500).json({ error: "Add Author Endpoint Error!" });
  }
});

// Download the file
router.get("/download/:filename", async (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "/../../uploads", filename);

  res.download(filePath, (err) => {
    if (err) {
      console.error("Error downloading the file:", err);
      res.status(500).send({ error: "Could not download the file" });
    }
  });
});

// Preview the file
router.get("/preview/:filename", async (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "/../../uploads", filename);

  // Set the header to inline so the PDF opens in the browser instead of downloading
  res.setHeader("Content-Disposition", "inline");
  res.setHeader("Content-Type", "application/pdf");

  // Send the file to the browser
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("Error serving the file:", err);
      res.status(500).send({ error: "Could not serve the file" });
    }
  });
});

module.exports = router;
