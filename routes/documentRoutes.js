const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const db = require('../database/db');

// Directory where files will be uploaded
const uploadDir = path.resolve(__dirname, '../uploads');

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
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type, only PDFs are allowed!'), false);
    }
};

const upload = multer({ storage, fileFilter });

router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Invalid file type, only PDFs are allowed!' });
        }

        const { title, authors, categories, keywords, abstract } = req.body;
        const filename = req.file.filename;

        // Check if title already exists
        const [existingDocument] = await db.promise().execute('SELECT title FROM researches WHERE title = ?', [title]);
        if (existingDocument.length > 0) {
            return res.status(409).json({ error: 'Document with this title already exists!' });
        }

        // Insert research
        const [result] = await db.promise().execute('INSERT INTO researches (title, publish_date, abstract, filename) VALUES (?, NOW(), ?, ?)', [title, abstract, filename]);
        const researchId = result.insertId;

        // Insert authors
        const insertAuthors = async (researchId, authors) => {
            const authorNames = authors.split(',').map(name => name.trim());
            for (const name of authorNames) {
                let [author] = await db.promise().execute('SELECT author_id FROM authors WHERE author_name = ?', [name]);
                if (author.length === 0) {
                    const [result] = await db.promise().execute('INSERT INTO authors (author_name) VALUES (?)', [name]);
                    author = { author_id: result.insertId };
                } else {
                    author = author[0];
                }
                await db.promise().execute('INSERT INTO research_authors (research_id, author_id) VALUES (?, ?)', [researchId, author.author_id]);
            }
        };

        await insertAuthors(researchId, authors);

        // Insert categories
        const insertCategories = async (researchId, categories) => {
            const categoryNames = categories.split(',').map(name => name.trim());
            for (const name of categoryNames) {
                let [category] = await db.promise().execute('SELECT category_id FROM category WHERE category_name = ?', [name]);
                if (category.length === 0) {
                    const [result] = await db.promise().execute('INSERT INTO category (category_name) VALUES (?)', [name]);
                    category = { category_id: result.insertId };
                } else {
                    category = category[0];
                }
                await db.promise().execute('INSERT INTO research_categories (research_id, category_id) VALUES (?, ?)', [researchId, category.category_id]);
            }
        };

        await insertCategories(researchId, categories);

        // Insert keywords
        const insertKeywords = async (researchId, keywords) => {
            const keywordNames = keywords.split(',').map(name => name.trim());
            for (const name of keywordNames) {
                let [keyword] = await db.promise().execute('SELECT keyword_id FROM keywords WHERE keyword_name = ?', [name]);
                if (keyword.length === 0) {
                    const [result] = await db.promise().execute('INSERT INTO keywords (keyword_name) VALUES (?)', [name]);
                    keyword = { keyword_id: result.insertId };
                } else {
                    keyword = keyword[0];
                }
                await db.promise().execute('INSERT INTO research_keywords (research_id, keyword_id) VALUES (?, ?)', [researchId, keyword.keyword_id]);
            }
        };

        await insertKeywords(researchId, keywords);

        res.status(201).json({ message: 'Document Uploaded Successfully' });
    } catch (error) {
        console.error('Error Upload Document:', error);
        res.status(500).json({ error: 'Upload Document Endpoint Error!' });
    }
});

module.exports = router;
