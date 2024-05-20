const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database/db');
const {authenticateToken} = require('../authentication/middleware');

const router = express.Router();

// Browse by category
router.get('/category/:category_id', async (req, res) => {
    try {
        const category_id = req.params.category_id;

        if (!category_id) {
            return res.status(400).json({ error: 'Please provide category id' });
        }

        const getCategoryQuery = 'SELECT * FROM category WHERE category_id = ?';
        const [category] = await db.promise().execute(getCategoryQuery, [category_id]);

        if (category.length === 0) {
            return res.status(404).json({ error: 'Category not found!' });
        }

        const getCategoryDocumentsQuery = `
            SELECT r.* 
            FROM researches r
            JOIN research_categories rc ON r.research_id = rc.research_id
            WHERE rc.category_id = ?
        `;
        const [categoryDocuments] = await db.promise().execute(getCategoryDocumentsQuery, [category_id]);

        res.status(200).json({ category: category[0], categoryDocuments });

    } catch (error) {
        console.error('Error getting documents from a category:', error);
        res.status(500).json({ error: 'Categories Endpoint Error!' });
    }
});

// Browse by keywords
router.get('/keywords/:keyword_id', async (req, res) => {
    try {
        const keyword_id = req.params.keyword_id;

        if (!keyword_id) {
            return res.status(400).json({ error: 'Please provide keyword id' });
        }

        const getKeywordQuery = 'SELECT * FROM keywords WHERE keyword_id = ?';
        const [keyword] = await db.promise().execute(getKeywordQuery, [keyword_id]);

        if (keyword.length === 0) {
            return res.status(404).json({ error: 'Keyword not found!' });
        }

        const getKeywordDocumentsQuery = `
            SELECT r.* 
            FROM researches r
            JOIN research_keywords rk ON r.research_id = rk.research_id
            WHERE rk.keyword_id = ?
        `;
        const [keywordDocuments] = await db.promise().execute(getKeywordDocumentsQuery, [keyword_id]);

        res.status(200).json({ keyword: keyword[0], keywordDocuments });

    } catch (error) {
        console.error('Error getting documents from a keyword:', error);
        res.status(500).json({ error: 'Keywords Endpoint Error!' });
    }
});

// Browse by authors
router.get('/authors/:author_id', async (req, res) => {
    try {
        const author_id = req.params.author_id;

        if (!author_id) {
            return res.status(400).json({ error: 'Please provide author id' });
        }

        const getAuthorQuery = 'SELECT * FROM authors WHERE author_id = ?';
        const [author] = await db.promise().execute(getAuthorQuery, [author_id]);

        if (author.length === 0) {
            return res.status(404).json({ error: 'Author not found!' });
        }

        const getAuthorDocumentsQuery = `
            SELECT r.* 
            FROM researches r
            JOIN research_authors ra ON r.research_id = ra.research_id
            WHERE ra.author_id = ?
        `;
        const [authorDocuments] = await db.promise().execute(getAuthorDocumentsQuery, [author_id]);

        res.status(200).json({ author: author[0], authorDocuments });

    } catch (error) {
        console.error('Error getting documents from an author:', error);
        res.status(500).json({ error: 'Authors Endpoint Error!' });
    }
});

// Endpoint to fetch authors based on query
router.get('/authors', async (req, res) => {
    try {
        const { query } = req.query;
        const [authors] = await db.promise().query('SELECT author_name FROM authors WHERE author_name LIKE ?', [`%${query}%`]);
        res.json(authors.map(author => author.author_name));
    } catch (error) {
        console.error('Error fetching authors:', error);
        res.status(500).json({ error: 'Failed to fetch authors' });
    }
});

// Endpoint to fetch keywords based on query
router.get('/keywords', async (req, res) => {
    try {
        const { query } = req.query;
        const [keywords] = await db.promise().query('SELECT keyword_name FROM keywords WHERE keyword_name LIKE ?', [`%${query}%`]);
        res.json(keywords.map(keyword => keyword.keyword_name));
    } catch (error) {
        console.error('Error fetching keywords:', error);
        res.status(500).json({ error: 'Failed to fetch keywords' });
    }
});

module.exports = router;
