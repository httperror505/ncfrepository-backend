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

// Most Cited Research
router.get("/most-cited", async (req, res) => {
  try {
    const getMostCitedQuery =
      "SELECT r.research_id, r.title, r.publish_date, r.abstract, r.filename, GROUP_CONCAT(DISTINCT a.author_name) AS authors, GROUP_CONCAT(DISTINCT k.keyword_name) AS keywords, r.viewCount, r.downloadCount, r.citeCount FROM researches r LEFT JOIN research_authors ra ON r.research_id = ra.research_id LEFT JOIN authors a ON ra.author_id = a.author_id LEFT JOIN research_keywords rk ON r.research_id = rk.research_id LEFT JOIN keywords k ON rk.keyword_id = k.keyword_id WHERE r.status = 'approved' GROUP BY r.research_id, r.title, r.publish_date, r.abstract, r.filename ORDER BY citeCount DESC LIMIT 3;";

    const [mostCited] = await db.promise().execute(getMostCitedQuery);
    res.status(200).json({ mostCited });
  } catch (error) {
    console.error("Error Get Most Cited:", error);
    res.status(500).json({ error: "Get Most Cited Endpoint Error!" });
  }
});

// Most Downloaded Research
router.get("/most-downloaded", async (req, res) => {
  try {
    const getMostDownloadedQuery =
      "SELECT r.research_id, r.title, r.publish_date, r.abstract, r.filename, GROUP_CONCAT(DISTINCT a.author_name) AS authors, GROUP_CONCAT(DISTINCT k.keyword_name) AS keywords, r.viewCount, r.downloadCount, r.citeCount FROM researches r LEFT JOIN research_authors ra ON r.research_id = ra.research_id LEFT JOIN authors a ON ra.author_id = a.author_id LEFT JOIN research_keywords rk ON r.research_id = rk.research_id LEFT JOIN keywords k ON rk.keyword_id = k.keyword_id WHERE r.status = 'approved' GROUP BY r.research_id, r.title, r.publish_date, r.abstract, r.filename ORDER BY downloadCount DESC LIMIT 3;";

    const [mostDownloaded] = await db.promise().execute(getMostDownloadedQuery);
    // console.log(mostDownloaded);
    res.status(200).json({ mostDownloaded });
  } catch (error) {
    console.error("Error Get Most Downloaded:", error);
    res.status(500).json({ error: "Get Most Downloaded Endpoint Error!" });
  }
});

// Most Viewed Research
router.get("/most-viewed", async (req, res) => {
  try {
    const getMostViewedQuery =
      "SELECT r.research_id, r.title, r.publish_date, r.abstract, r.filename, GROUP_CONCAT(DISTINCT a.author_name) AS authors, GROUP_CONCAT(DISTINCT k.keyword_name) AS keywords, r.viewCount, r.downloadCount, r.citeCount FROM researches r LEFT JOIN research_authors ra ON r.research_id = ra.research_id LEFT JOIN authors a ON ra.author_id = a.author_id LEFT JOIN research_keywords rk ON r.research_id = rk.research_id LEFT JOIN keywords k ON rk.keyword_id = k.keyword_id WHERE r.status = 'approved' GROUP BY r.research_id, r.title, r.publish_date, r.abstract, r.filename ORDER BY viewCount DESC LIMIT 3;";

    const [mostViewed] = await db.promise().execute(getMostViewedQuery);
    res.status(200).json({ mostViewed });
  } catch (error) {
    console.error("Error Get Most Viewed:", error);
    res.status(500).json({ error: "Get Most Viewed Endpoint Error!" });
  }
});

module.exports = router;
