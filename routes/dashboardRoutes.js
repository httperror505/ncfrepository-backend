const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database/db');
const {authenticateToken, isAdmin, isNCFUser, isNotNCFUser } = require('./authentication/middleware');

const router = express.Router();

// Citations Management
// Increment citation count for each document
router.post('/citations/:document_id', (req, res) => {

    const documentId = req.params.document_id;

    // Update citation count in the database
    const updateQuery = 'UPDATE document SET citation_count = citation_count + 1 WHERE document_id = ?';

    db.query(updateQuery, [documentId], (error, result) => {

        if (error) {
            console.error('Error updating citation count:', error);
            res.status(500).json({ error: 'An error occurred while updating citation count' });
        } else {
            res.status(200).json({ message: 'Citation count updated successfully' });
        }
    });
});

// Get the citation count of a document
router.get('/citations/admin/:document_id', isAdmin, (req, res) => {

    const documentId = req.params.document_id;

    // Get the citation count from the database
    const getCitedQuery = 'SELECT citation_count FROM document WHERE document_id = ?';

    db.query(getCitedQuery, [documentId], (error, result) => {

        if (error) {
            console.error('Error getting citation count:', error);
            res.status(500).json({ error: 'An error occurred while getting citation count' });
        } else {
            res.status(200).json({ citationCount: result[0].citation_count });
        }
    });

});

// Get the citation count of all documents
router.get('/citations', (req, res) => {

    // Get the citation count from the database
    const getCitedQuery = 'SELECT document_id, citation_count FROM document';

    db.query(getCitedQuery, (error, result) => {

        if (error) {
            console.error('Error getting total citation count:', error);
            res.status(500).json({ error: 'An error occurred while getting total citation count' });
        } else {
            res.status(200).json(result);
        }
    });

});

// Get the citation of the document if the user is the uploader/author
router.get('/citations/user/:document_id', authenticateToken, (req, res) => {

    const documentId = req.params.document_id;

    // Get the citation count from the database
    const getCitedQuery = 'SELECT citation_count FROM document WHERE document_id = ?';

    db.query(getCitedQuery, [documentId], (error, result) => {

        if (error) {
            console.error('Error getting citation count:', error);
            res.status(500).json({ error: 'An error occurred while getting citation count' });
        } else {
            res.status(200).json({ citationCount: result[0].citation_count });
        }
    });

});

// Downloads Count Management

module.exports = router;