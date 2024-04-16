const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database/db');
const {authenticateToken, isAdmin, isNCFUser, isNotNCFUser } = require('../authentication/middleware');

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

// Get the citation count of all documents and total it to 1 result
router.get('/citations/total', (req, res) => {
    
    // Get the citation count from the database
    const getTotalCitesQuery = 'SELECT document_id, citation_count FROM document';

    db.query(getTotalCitesQuery, (error, result) => {

        if (error) {
            console.error('Error getting total citation count:', error);
            res.status(500).json({ error: 'An error occurred while getting total citation count' });
        } else {
            let totalCitation = 0;
            result.forEach((document) => {
                totalCitation += document.citation_count;
            });
            res.status(200).json({ totalCitation });
        }
    });

});

// Get the citation count of the document if the user is the uploader/author
// Note: Not Working!!
router.get('/citations/user/:document_id', authenticateToken, (req, res) => {
    const documentId = req.params.document_id;
    const userId = req.user.id; // Assuming the user ID is stored in req.user.id after authentication

    // Check if the logged-in user is the author of the document
    const checkAuthorQuery = 'SELECT author_id FROM document WHERE document_id = ?';
    db.query(checkAuthorQuery, [documentId], (error, result) => {
        if (error) {
            console.error('Error checking document author:', error);
            return res.status(500).json({ error: 'An error occurred while checking document author' });
        }

        // If the document doesn't exist
        if (result.length === 0) {
            return res.status(404).json({ error: 'Document not found' });
        }

        const authorId = result[0].author_id;

        // Check if the logged-in user is the author of the document
        if (authorId !== userId) {
            return res.status(403).json({ error: 'Forbidden: You are not the author of this document' });
        }

        // Get the citation count from the database
        const getCitedQuery = 'SELECT citation_count FROM document WHERE document_id = ?';
        db.query(getCitedQuery, [documentId], (error, result) => {
            if (error) {
                console.error('Error getting citation count:', error);
                return res.status(500).json({ error: 'An error occurred while getting citation count' });
            }

            if (result.length === 0) {
                return res.status(404).json({ error: 'Document not found' });
            }

            res.status(200).json({ citationCount: result[0].citation_count });
        });
    });
});


// Downloads Count Management

module.exports = router;