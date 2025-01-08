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
// router.get("/most-cited", async (req, res) => {
//   try {
//     const getMostCitedQuery = `
//       SELECT
//         r.research_id,
//         r.title,
//         r.publish_date,
//         r.abstract,
//         r.filename,
//         GROUP_CONCAT(DISTINCT a.author_name) AS authors,
//         GROUP_CONCAT(DISTINCT k.keyword_name) AS keywords,
//         c.citation_count AS citeCount,
//         d.download_count AS downloadCount,
//         v.view_count AS viewCount
//       FROM researches r
//       LEFT JOIN research_authors ra ON r.research_id = ra.research_id
//       LEFT JOIN authors a ON ra.author_id = a.author_id
//       LEFT JOIN research_keywords rk ON r.research_id = rk.research_id
//       LEFT JOIN keywords k ON rk.keyword_id = k.keyword_id
//       LEFT JOIN citations c ON r.research_id = c.research_id
//       LEFT JOIN downloads d ON r.research_id = d.research_id
//       LEFT JOIN views v ON r.research_id = v.research_id
//       WHERE r.status = 'approved'
//       GROUP BY
//         r.research_id,
//         r.title,
//         r.publish_date,
//         r.abstract,
//         r.filename,
//         c.citation_count
//       ORDER BY c.citation_count DESC
//       LIMIT 3;
//     `;

//     const [mostCited] = await db.promise().execute(getMostCitedQuery);
//     res.status(200).json({ mostCited });
//   } catch (error) {
//     console.error("Error Get Most Cited:", error);
//     res.status(500).json({ error: "Get Most Cited Endpoint Error!" });
//   }
// });
router.get("/most-cited", async (req, res) => {
  try {
    const getMostCitedQuery = `
        SELECT 
          r.research_id, 
          r.title, 
          r.publish_date, 
          r.abstract, 
          r.filename, 
          GROUP_CONCAT(DISTINCT a.author_name ORDER BY a.author_name ASC) AS authors, 
          GROUP_CONCAT(DISTINCT k.keyword_name ORDER BY k.keyword_name ASC) AS keywords, 
          c.total_cites AS citeCount,
          d.total_downloads AS downloadCount,
          v.total_views AS viewCount
        FROM researches r
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
        WHERE r.status = 'approved'
        GROUP BY 
            r.research_id, 
            r.title, 
            r.publish_date, 
            r.abstract, 
            r.filename,
            c.total_cites, 
            d.total_downloads, 
            v.total_views
        ORDER BY citeCount DESC
        LIMIT 3;
    `;

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
    const getMostDownloadedQuery =`SELECT 
          r.research_id, 
          r.title, 
          r.publish_date, 
          r.abstract, 
          r.filename, 
          GROUP_CONCAT(DISTINCT a.author_name ORDER BY a.author_name ASC) AS authors, 
          GROUP_CONCAT(DISTINCT k.keyword_name ORDER BY k.keyword_name ASC) AS keywords, 
          c.total_cites AS citeCount,
          d.total_downloads AS downloadCount,
          v.total_views AS viewCount
        FROM researches r
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
        WHERE r.status = 'approved'
        GROUP BY 
            r.research_id, 
            r.title, 
            r.publish_date, 
            r.abstract, 
            r.filename,
            c.total_cites, 
            d.total_downloads, 
            v.total_views
        ORDER BY downloadCount DESC
        LIMIT 3;`;

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
    const getMostViewedQuery =`SELECT 
          r.research_id, 
          r.title, 
          r.publish_date, 
          r.abstract, 
          r.filename, 
          GROUP_CONCAT(DISTINCT a.author_name ORDER BY a.author_name ASC) AS authors, 
          GROUP_CONCAT(DISTINCT k.keyword_name ORDER BY k.keyword_name ASC) AS keywords, 
          c.total_cites AS citeCount,
          d.total_downloads AS downloadCount,
          v.total_views AS viewCount
        FROM researches r
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
        WHERE r.status = 'approved'
        GROUP BY 
            r.research_id, 
            r.title, 
            r.publish_date, 
            r.abstract, 
            r.filename,
            c.total_cites, 
            d.total_downloads, 
            v.total_views
        ORDER BY viewCount DESC
        LIMIT 3;`;

    const [mostViewed] = await db.promise().execute(getMostViewedQuery);
    res.status(200).json({ mostViewed });
  } catch (error) {
    console.error("Error Get Most Viewed:", error);
    res.status(500).json({ error: "Get Most Viewed Endpoint Error!" });
  }
});

module.exports = router;
