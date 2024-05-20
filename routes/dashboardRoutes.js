const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database/db');
const {authenticateToken, isAdmin, isNCFUser, isNotNCFUser } = require('../authentication/middleware');

const router = express.Router();

// Citations Management
// Increment citation count for each document
router.patch('/citations/:research_id', (req, res) => {

    const researchId = req.params.research_id;

    // Update citation count in the database
    const updateQuery = 'UPDATE researches SET citeCount = citeCount + 1 WHERE research_id = ?';

    db.query(updateQuery, [researchId], (error, result) => {

        if (error) {
            console.error('Error updating citation count:', error);
            res.status(500).json({ error: 'An error occurred while updating citation count' });
        } else {
            res.status(200).json({ message: 'Citation count updated successfully' });
        }
    });
});

// Get the citation count of a document
router.get('/citations/:research_id', (req, res) => {

    const researchId = req.params.research_id;

    // Get the citation count from the database
    const getCitedQuery = 'SELECT citeCount FROM researches WHERE research_id = ?';

    db.query(getCitedQuery, [researchId], (error, result) => {

        if (error) {
            console.error('Error getting citation count:', error);
            res.status(500).json({ error: 'An error occurred while getting citation count' });
        } else if (result.length === 0) {
            res.status(404).json({ error: 'Document not found' });
        } else {
            res.status(200).json({ citationCount: result[0].citeCount });
        }
    });

});

// Get the citation count of all documents
router.get('/citations', (req, res) => {

    // Get the citation count from the database
    const getCitedQuery = 'SELECT research_id, citeCount FROM researches';

    db.query(getCitedQuery, (error, result) => {

        if (error) {
            console.error('Error getting total citation count:', error);
            res.status(500).json({ error: 'An error occurred while getting total citation count' });
        } else {
            res.status(200).json(result);
        }
    });

});

// Get the total citation count of all documents
router.post('/total/citations', (req, res) => {
    // Use SQL to sum the citation counts
    const getTotalCitesQuery = 'SELECT SUM(citeCount) AS totalCitation FROM researches';

    db.query(getTotalCitesQuery, (error, result) => {
        if (error) {
            console.error('Error getting total citation count:', error);
            res.status(500).json({ error: 'An error occurred while getting total citation count' });
        } else {
            const totalCitation = result[0].totalCitation || 0; // Handle case where result is NULL
            res.status(200).json({ totalCitation });
        }
    });
});


// Downloads Count Management
// Increment download count for each document
router.post('/downloads/:research_id', (req, res) => {

    const researchId = req.params.research_id;

    // Update citation count in the database
    const updateQuery = 'UPDATE researches SET downloadCount = downloadCount + 1 WHERE research_id = ?';

    db.query(updateQuery, [researchId], (error, result) => {

        if (error) {
            console.error('Error updating download count:', error);
            res.status(500).json({ error: 'An error occurred while updating download count' });
        } else {
            res.status(200).json({ message: 'Download count updated successfully' });
        }
    });
});

// Get the download count of a document
router.get('/downloads/:research_id', (req, res) => {
    const researchId = req.params.research_id;

    const getDownloadedQuery = 'SELECT downloadCount FROM researches WHERE research_id = ?';

    db.query(getDownloadedQuery, [researchId], (error, result) => {
        if (error) {
            console.error('Error getting download count:', error);
            res.status(500).json({ error: 'An error occurred while getting download count' });
        } else if (result.length === 0) {
            res.status(404).json({ error: 'Document not found' });
        } else {
            res.status(200).json({ downloadCount: result[0].downloadCount });
        }
    });
});


// Get the download count of all documents
router.get('/downloads', (req, res) => {

    // Get the citation count from the database
    const getDownloadedQuery = 'SELECT research_id, downloadCount FROM researches';

    db.query(getDownloadedQuery, (error, result) => {

        if (error) {
            console.error('Error getting total download count:', error);
            res.status(500).json({ error: 'An error occurred while getting total download count' });
        } else {
            res.status(200).json(result);
        }
    });

});

router.post('/total/downloads', (req, res) => {
    // Use SQL to sum the download counts
    const getTotalDownloadsQuery = 'SELECT SUM(downloadCount) AS totalDownloads FROM researches';

    db.query(getTotalDownloadsQuery, (error, result) => {
        if (error) {
            console.error('Error getting total download count:', error);
            res.status(500).json({ error: 'An error occurred while getting total download count' });
        } else {
            const totalDownloads = result[0].totalDownloads || 0;
            res.status(200).json({ totalDownloads });
        }
    });
});

module.exports = router;