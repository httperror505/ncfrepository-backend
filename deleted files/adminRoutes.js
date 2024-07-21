const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../database/db");
const {
  authenticateToken,
  isAdmin,
  isNCFUser,
  isNotNCFUser,
} = require("../authentication/middleware");

const router = express.Router();

// Approve the research
router.patch('/research/approve/:research_id', async (req, res) => {
    try {
        const researchId = req.params.research_id;
        
        const updateStatusQuery = 'UPDATE researches SET status = ? WHERE research_id = ?';
        const [result] = await db.promise().execute(updateStatusQuery, ['approved', researchId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Research not found' });
        }

        res.status(200).json({ message: 'Research approved successfully' });
    } catch (error) {
        console.error('Error approving research:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Reject the research
router.patch('/research/reject/:research_id', async (req, res) => {
    try {
        const researchId = req.params.research_id;
        
        const updateStatusQuery = 'UPDATE researches SET status = ? WHERE research_id = ?';
        const [result] = await db.promise().execute(updateStatusQuery, ['rejected', researchId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Research not found' });
        }

        res.status(200).json({ message: 'Research rejected successfully' });
    } catch (error) {
        console.error('Error rejecting research:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// View the research
router.get('/research/:research_id', async (req, res) => {
    try {
        const researchId = req.params.research_id;

        const getResearchQuery = 'SELECT * FROM researches WHERE research_id = ?';
        const [rows] = await db.promise().execute(getResearchQuery, [researchId]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Research not found' });
        }

        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Error viewing research:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// View all researches
router.get("/researches", async (req, res) => {
  try {
    const [researches] = await db.promise().execute("SELECT * FROM researches");
    res.status(200).json(researches);
  } catch (error) {
    console.error("Error getting researches:", error);
    res
      .status(500)
      .json({ error: "An error occurred while getting researches" });
  }
});

module.exports = router;
