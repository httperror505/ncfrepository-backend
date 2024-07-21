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

const router = express.Router();

// Citations Management
// Increment citation count for each document
router.patch("/citations/:research_id", (req, res) => {
  const researchId = req.params.research_id;

  // Update citation count in the database
  const updateQuery =
    "UPDATE researches SET citeCount = citeCount + 1 WHERE research_id = ?";

  db.query(updateQuery, [researchId], (error, result) => {
    if (error) {
      console.error("Error updating citation count:", error);
      res
        .status(500)
        .json({ error: "An error occurred while updating citation count" });
    } else {
      res.status(200).json({ message: "Citation count updated successfully" });
    }
  });
});

// Get the citation count of a document
router.get("/citations/:research_id", (req, res) => {
  const researchId = req.params.research_id;

  // Get the citation count from the database
  const getCitedQuery =
    "SELECT citeCount FROM researches WHERE research_id = ?";

  db.query(getCitedQuery, [researchId], (error, result) => {
    if (error) {
      console.error("Error getting citation count:", error);
      res
        .status(500)
        .json({ error: "An error occurred while getting citation count" });
    } else if (result.length === 0) {
      res.status(404).json({ error: "Document not found" });
    } else {
      res.status(200).json({ citationCount: result[0].citeCount });
    }
  });
});


// Downloads Count Management
// Increment download count for each document
router.post("/downloads/:research_id", (req, res) => {
  const researchId = req.params.research_id;

  // Update citation count in the database
  const updateQuery =
    "UPDATE researches SET downloadCount = downloadCount + 1 WHERE research_id = ?";

  db.query(updateQuery, [researchId], (error, result) => {
    if (error) {
      console.error("Error updating download count:", error);
      res
        .status(500)
        .json({ error: "An error occurred while updating download count" });
    } else {
      res.status(200).json({ message: "Download count updated successfully" });
    }
  });
});

// Get the download count of a document
router.get("/downloads/:research_id", (req, res) => {
  const researchId = req.params.research_id;

  const getDownloadedQuery =
    "SELECT downloadCount FROM researches WHERE research_id = ?";

  db.query(getDownloadedQuery, [researchId], (error, result) => {
    if (error) {
      console.error("Error getting download count:", error);
      res
        .status(500)
        .json({ error: "An error occurred while getting download count" });
    } else if (result.length === 0) {
      res.status(404).json({ error: "Document not found" });
    } else {
      res.status(200).json({ downloadCount: result[0].downloadCount });
    }
  });
});


// View Count Management
// Increment view count for each document
router.post("/views/:research_id", (req, res) => {
  const researchId = req.params.research_id;

  

});


module.exports = router;
