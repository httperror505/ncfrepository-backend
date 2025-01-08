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

  const getViewCountQuery =
    "SELECT viewCount FROM researches WHERE research_id = ?";

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
      const updateViewCountQuery =
        "UPDATE researches SET viewCount = ? WHERE research_id = ?";
      db.query(
        updateViewCountQuery,
        [updatedViewCount, researchId],
        (error, result) => {
          if (error) {
            console.error("Error updating view count:", error);
          }
        }
      );
      res.status(200).json({ message: "View count updated successfully" });
    }
  });
});

//  Get the research for the specified uploader_id
router.get("/research/get/:uploader_id", (req, res) => {
  const uploaderId = req.params.uploader_id;

  // const getResearchQuery = "SELECT * FROM researches WHERE uploader_id = ?";
  const getResearchQuery = `SELECT 
        r.research_id, 
        r.title, 
        r.publish_date, 
        r.abstract, 
        r.filename, 
        GROUP_CONCAT(DISTINCT a.author_name) AS authors, 
        GROUP_CONCAT(DISTINCT k.keyword_name) AS keywords, 
        GROUP_CONCAT(DISTINCT c.category_name) AS categories,
        r.viewCount, 
        r.downloadCount, 
        r.citeCount,
        r.status,
        r.uploader_id
        FROM researches r 
        LEFT JOIN research_authors ra ON r.research_id = ra.research_id 
        LEFT JOIN authors a ON ra.author_id = a.author_id 
        LEFT JOIN research_keywords rk ON r.research_id = rk.research_id 
        LEFT JOIN keywords k ON rk.keyword_id = k.keyword_id 
        LEFT JOIN research_categories rc ON r.research_id = rc.research_id
        LEFT JOIN category c ON rc.category_id = c.category_id
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

// Add to collection
router.post("/add-to-collection", async (req, res) => {
  try {
    const { research_id, user_id } = req.body;

    const addToCollectionQuery = `
      INSERT INTO collections (research_id, user_id )
      VALUES (?, ?)
    `;
    await db.promise().execute(addToCollectionQuery, [research_id, user_id]);

    res
      .status(200)
      .json({ message: "Document added to collection successfully" });
  } catch (error) {
    console.error("Error adding document to collection:", error);
    res.status(500).json({ error: "Collection Endpoint Error" });
  }
});

/// Get all the researches in the collection based on user_id
router.get("/get-collections/:user_id", async (req, res) => {
  try {
    const user_id = req.params.user_id;

    const getCollectionQuery = `
      SELECT r.research_id, 
             r.title, 
             r.publish_date, 
             r.abstract, 
             r.filename, 
             GROUP_CONCAT(DISTINCT a.author_name ORDER BY a.author_name ASC) AS authors, 
             GROUP_CONCAT(DISTINCT k.keyword_name ORDER BY k.keyword_name ASC) AS keywords, 
             COALESCE(c.total_cites, 0) AS citeCount,
             COALESCE(d.total_downloads, 0) AS downloadCount,
             COALESCE(v.total_views, 0) AS viewCount
      FROM collections col
      LEFT JOIN researches r ON col.research_id = r.research_id
      LEFT JOIN research_authors ra ON r.research_id = ra.research_id
      LEFT JOIN authors a ON ra.author_id = a.author_id
      LEFT JOIN research_keywords rk ON r.research_id = rk.research_id
      LEFT JOIN keywords k ON rk.keyword_id = k.keyword_id
      LEFT JOIN (
          SELECT research_id, SUM(citation_count) AS total_cites
          FROM citations
          GROUP BY research_id
      ) c ON r.research_id = c.research_id
      LEFT JOIN (
          SELECT research_id, SUM(download_count) AS total_downloads
          FROM downloads
          GROUP BY research_id
      ) d ON r.research_id = d.research_id
      LEFT JOIN (
          SELECT research_id, SUM(view_count) AS total_views
          FROM views
          GROUP BY research_id
      ) v ON r.research_id = v.research_id
      WHERE col.user_id = ?
       GROUP BY 
            r.research_id, 
            r.title, 
            r.publish_date, 
            r.abstract, 
            r.filename,
            c.total_cites, 
            d.total_downloads, 
            v.total_views;
    `;
    
    db.query(getCollectionQuery, [user_id], (error, result) => {
      if (error) {
        console.error("Error getting collections:", error);
        return res.status(500).json({ error: "Collection Endpoint Error" });
      }
      res.status(200).json(result);
    });

  } catch (error) {
    console.error("Error in the route:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// New database adjustment
router.post("/add/citations/:research_id", (req, res) => {
  const researchId = req.params.research_id;

  // Insert a new citation record with the timestamp
  const insertCitationQuery =
    "INSERT INTO citations (research_id, citation_count) VALUES (?, 1)";

  db.query(insertCitationQuery, [researchId], (error, result) => {
    if (error) {
      console.error("Error adding citation:", error);
      return res
        .status(500)
        .json({ error: "An error occurred while adding citation" });
    }
    res.status(200).json({ message: "Citation added successfully!" });
  });
});

router.post("/add/views/:research_id", (req, res) => {
  const researchId = req.params.research_id;

  // Insert a new citation record with the timestamp
  const insertCitationQuery =
    "INSERT INTO views (research_id, view_count) VALUES (?, 1)";

  db.query(insertCitationQuery, [researchId], (error, result) => {
    if (error) {
      console.error("Error adding view count:", error);
      return res
        .status(500)
        .json({ error: "An error occurred while adding view count." });
    }
    res.status(200).json({ message: "View Count added successfully!" });
  });
});

router.post("/add/downloads/:research_id", (req, res) => {
  const researchId = req.params.research_id;

  // Insert a new citation record with the timestamp
  const insertCitationQuery =
    "INSERT INTO downloads (research_id, download_count) VALUES (?, 1)";

  db.query(insertCitationQuery, [researchId], (error, result) => {
    if (error) {
      console.error("Error adding download count:", error);
      return res
        .status(500)
        .json({ error: "An error occurred while adding download count" });
    }
    res.status(200).json({ message: "Download count added successfully!" });
  });
});

module.exports = router;
