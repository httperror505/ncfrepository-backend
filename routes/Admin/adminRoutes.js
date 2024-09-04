const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("./../../database/db");
const {
  authenticateToken,
  isAdmin,
  isNCFUser,
  isNotNCFUser,
} = require("./../../authentication/middleware");

const router = express.Router();

// Approve the research
router.patch("/research/approve/:research_id", async (req, res) => {
  try {
    const researchId = req.params.research_id;

    const updateStatusQuery =
      "UPDATE researches SET status = ? WHERE research_id = ?";
    const [result] = await db
      .promise()
      .execute(updateStatusQuery, ["approved", researchId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Research not found" });
    }

    res.status(200).json({ message: "Research approved successfully" });
  } catch (error) {
    console.error("Error approving research:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Reject the research
router.patch("/research/reject/:research_id", async (req, res) => {
  try {
    const researchId = req.params.research_id;

    const updateStatusQuery =
      "UPDATE researches SET status = ? WHERE research_id = ?";
    const [result] = await db
      .promise()
      .execute(updateStatusQuery, ["rejected", researchId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Research not found" });
    }

    res.status(200).json({ message: "Research rejected successfully" });
  } catch (error) {
    console.error("Error rejecting research:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// View the research
router.get("/research/:research_id", async (req, res) => {
  try {
    const researchId = req.params.research_id;

    const getResearchQuery = "SELECT * FROM researches WHERE research_id = ?";
    const [rows] = await db.promise().execute(getResearchQuery, [researchId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Research not found" });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Error viewing research:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// View all researches
router.get("/researches", async (req, res) => {
  try {
    const [researches] = await db
      .promise()
      .execute(
        "SELECT r.research_id, r.title, r.publish_date, r.abstract, r.filename, GROUP_CONCAT(DISTINCT a.author_name) AS authors, GROUP_CONCAT(DISTINCT k.keyword_name) AS keywords, r.viewCount, r.downloadCount, r.citeCount FROM researches r LEFT JOIN research_authors ra ON r.research_id = ra.research_id LEFT JOIN authors a ON ra.author_id = a.author_id LEFT JOIN research_keywords rk ON r.research_id = rk.research_id LEFT JOIN keywords k ON rk.keyword_id = k.keyword_id WHERE r.status = 'approved' GROUP BY r.research_id, r.title, r.publish_date, r.abstract, r.filename ORDER BY r.title"
      );
    res.status(200).json(researches);
  } catch (error) {
    console.error("Error getting researches:", error);
    res
      .status(500)
      .json({ error: "An error occurred while getting researches" });
  }
});

// Citation
// Get the citation count of all documents
router.get("/citations", (req, res) => {
  // Get the citation count from the database
  const getCitedQuery = "SELECT research_id, title, citeCount FROM researches";

  db.query(getCitedQuery, (error, result) => {
    if (error) {
      console.error("Error getting total citation count:", error);
      res.status(500).json({
        error: "An error occurred while getting total citation count",
      });
    } else {
      res.status(200).json(result);
    }
  });
});
// Get the total citation count of all documents
router.post("/total/citations", (req, res) => {
  // Use SQL to sum the citation counts
  const getTotalCitesQuery =
    "SELECT SUM(citeCount) AS totalCitation FROM researches";

  db.query(getTotalCitesQuery, (error, result) => {
    if (error) {
      console.error("Error getting total citation count:", error);
      res.status(500).json({
        error: "An error occurred while getting total citation count",
      });
    } else {
      const totalCitation = result[0].totalCitation || 0; // Handle case where result is NULL
      res.status(200).json({ totalCitation });
    }
  });
});

// Download
// Get the download count of all documents
router.get("/downloads", (req, res) => {
  // Get the citation count from the database
  const getDownloadedQuery =
    "SELECT research_id,  downloadCount FROM researches";

  db.query(getDownloadedQuery, (error, result) => {
    if (error) {
      console.error("Error getting total download count:", error);
      res.status(500).json({
        error: "An error occurred while getting total download count",
      });
    } else {
      res.status(200).json(result);
    }
  });
});
// Get the total download count of all documents
router.post("/total/downloads", (req, res) => {
  // Use SQL to sum the download counts
  const getTotalDownloadsQuery =
    "SELECT SUM(downloadCount) AS totalDownloads FROM researches";

  db.query(getTotalDownloadsQuery, (error, result) => {
    if (error) {
      console.error("Error getting total download count:", error);
      res.status(500).json({
        error: "An error occurred while getting total download count",
      });
    } else {
      const totalDownloads = result[0].totalDownloads || 0;
      res.status(200).json({ totalDownloads });
    }
  });
});

// View
// Get the view count of all documents
router.get("/views", (req, res) => {
  // Get the citation count from the database
  const getDownloadedQuery = "SELECT research_id,  viewCount FROM researches";

  db.query(getDownloadedQuery, (error, result) => {
    if (error) {
      console.error("Error getting total view count:", error);
      res.status(500).json({
        error: "An error occurred while getting total view count",
      });
    } else {
      res.status(200).json(result);
    }
  });
});
// Get the total view count of all documents
router.post("/total/views", (req, res) => {
  // Use SQL to sum the view counts
  const getTotalViewsQuery =
    "SELECT SUM(viewCount) AS totalViews FROM researches";

  db.query(getTotalViewsQuery, (error, result) => {
    if (error) {
      console.error("Error getting total view count:", error);
      res
        .status(500)
        .json({ error: "An error occurred while getting total view count" });
    } else {
      const totalViews = result[0].totalViews || 0;
      res.status(200).json({ totalViews });
    }
  });
});

module.exports = router;
