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
router.patch("/downloads/:research_id", (req, res) => {
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
router.patch("/views/:research_id", (req, res) => {
  const researchId = req.params.research_id;

  const getViewCountQuery = "SELECT viewCount FROM researches WHERE research_id = ?";

  db.query(getViewCountQuery, [researchId], (error, result) => {
    if (error) {
      console.error("Error getting view count:", error);
      res
        .status(500)
        .json({ error: "An error occurred while getting view count" });
    } else if (result.length === 0) {
      res.status(404).json({ error: "Document not found" });
    } else {
      const viewCount = result[0].viewCount;
      const updatedViewCount = viewCount + 1;
      const updateViewCountQuery = "UPDATE researches SET viewCount = ? WHERE research_id = ?";
      db.query(updateViewCountQuery, [updatedViewCount, researchId], (error, result) => {
        if (error) {
          console.error("Error updating view count:", error);
        }
      });
      res.status(200).json({ message: "View count updated successfully" });
    }
  });
});

//  Get the research for the specified uploader_id
router.get("/research/get/:uploader_id", (req, res) => {
  const uploaderId = req.params.uploader_id;

  // const getResearchQuery = "SELECT * FROM researches WHERE uploader_id = ?";
  const getResearchQuery =`SELECT 
        r.research_id, 
        r.title, 
        r.publish_date, 
        r.abstract, 
        r.filename, 
        GROUP_CONCAT(DISTINCT a.author_name) AS authors, 
        GROUP_CONCAT(DISTINCT k.keyword_name) AS keywords, 
        r.viewCount, 
        r.downloadCount, 
        r.citeCount,
        r.uploader_id
        FROM researches r 
        LEFT JOIN research_authors ra ON r.research_id = ra.research_id 
        LEFT JOIN authors a ON ra.author_id = a.author_id 
        LEFT JOIN research_keywords rk ON r.research_id = rk.research_id 
        LEFT JOIN keywords k ON rk.keyword_id = k.keyword_id 
        WHERE r.uploader_id = ?
        GROUP BY r.research_id, r.title, r.publish_date, r.abstract, r.filename 
        ORDER BY r.title`;
  
  db.query(getResearchQuery, [uploaderId], (error, result) => {
    if (error) {
      console.error("Error getting research:", error);
      res
        .status(500)
        .json({ error: "An error occurred while getting research" });
    } else if (result.length === 0) {
      res.status(404).json({ error: "Research not found" });
    } else {
      res.status(200).json(result);
    }
  });
});


module.exports = router;
