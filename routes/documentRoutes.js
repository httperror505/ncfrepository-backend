const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database/db');
const {authenticateToken, isAdmin, isNCFUser, isNotNCFUser } = require('../authentication/middleware');

const router = express.Router();

// Upload Document
router.post('/upload', isAdmin || isNCFUser, authenticateToken, async (req, res) => {
    try {

        const { title, author, publish_date, abstract, citation,  category_id, doctype_id, department_id, course_id } = req.body;

        if (!title || !author || !publish_date || !abstract || !citation || !category_id || !doctype_id || !department_id || !course_id) {
            return res.status(400).json({error: 'Please fill in all fields!'});
        }

        const checkTitleQuery = 'SELECT title FROM document WHERE title = ?';
        const [existingDocument] = await db.promise().execute(checkTitleQuery, [title]);

        if (existingDocument.length > 0) {
            return res.status(409).json({error: 'Document with this title already exists!'});
        }

        const insertDocumentQuery = 'INSERT INTO document (title, author, publish_date, abstract, citation, category_id, doctype_id, department_id, course_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
        await db.promise().execute(insertDocumentQuery, [title, author, publish_date, abstract, citation, category_id, doctype_id, department_id, course_id]);

        res.status(201).json({message: 'Document Uploaded Successfully'});

    } catch (error) {
        console.error('Error Upload Document: ', error);
        res.status(500).json({error: 'Pload Document Endpoint Error!'});
    }

});

// Modify document
router.put('/modify/:document_id', isAdmin || isNCFUser, authenticateToken, async (req, res) => {
    try {
        const { title, author, publish_date, abstract, citation, category_id, doctype_id, department_id, course_id } = req.body;
        const document_id = req.params.document_id;

        if (!title || !author || !publish_date || !abstract || !citation || !category_id || !doctype_id || !department_id || !course_id) {
            return res.status(400).json({error: 'Please fill in all fields!'});
        }

        const checkDocumentQuery = 'SELECT * FROM document WHERE document_id = ?';
        const [existingDocument] = await db.promise().execute(checkDocumentQuery, [document_id]);

        if (existingDocument.length === 0) {
            return res.status(404).json({error: 'Document not found!'});
        }

        const updateDocumentQuery = 'UPDATE document SET title = ?, author = ?, publish_date = ?, abstract = ?, citation = ?, category_id = ?, doctype_id = ?, department_id = ?, course_id = ? WHERE document_id = ?';
        await db.promise().execute(updateDocumentQuery, [title, author, publish_date, abstract, citation, category_id, doctype_id, department_id, course_id, document_id]);

        res.status(200).json({message: 'Document Modified Successfully'});

    } catch (error) {
        console.error('Error Modifying Document: ', error);
        res.status(500).json({error: 'Modify Document Endpoint Error!'});
    }
});

router.delete('/delete/:document_id', isAdmin, authenticateToken, async (req, res) => {
    try {
        const document_id = req.params.document_id;

        const checkDocumentQuery = 'SELECT * FROM document WHERE document_id = ?';
        const [existingDocument] = await db.promise().execute(checkDocumentQuery, [document_id]);

        if (existingDocument.length === 0) {
            return res.status(404).json({error: 'Document not found!'});
        }

        const deleteDocumentQuery = 'ALTER TABLE document SET status_id = 2 WHERE document_id = ?';
        await db.promise().execute(deleteDocumentQuery, [document_id]);

        res.status(200).json({message: 'Document Deleted Successfully'});

    } catch (error) {
        console.error('Error Deleting Document: ', error);
        res.status(500).json({error: 'Delete Document Endpoint Error!'});
    }
});

router.get('/document/all/active', async (req, res) => {
    try {
        const getDocumentsQuery = 'SELECT * FROM document WHERE status_id = 1';
        const [documents] = await db.promise().execute(getDocumentsQuery);

        res.status(200).json(documents);

    } catch (error) {
        console.error('Error Fetching Documents: ', error);
        res.status(500).json({error: 'Fetch Documents Endpoint Error!'});
    }
});

router.get('/document/all/archived', async (req, res) => {
    try {
        const getDocumentsQuery = 'SELECT * FROM document WHERE status_id = 0';
        const [documents] = await db.promise().execute(getDocumentsQuery);

        res.status(200).json(documents);

    } catch (error) {
        console.error('Error Fetching Documents: ', error);
        res.status(500).json({error: 'Fetch Documents Endpoint Error!'});
    }
});

module.exports = router;