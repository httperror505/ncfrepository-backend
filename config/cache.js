let cachedDocuments = [];
const db = require("../database/db");

function loadDocuments() {
    try {
      db.query(
        `SELECT 
              r.research_id, 
              r.title, 
              r.abstract, 
              GROUP_CONCAT(DISTINCT a.author_name) AS authors, 
              GROUP_CONCAT(DISTINCT k.keyword_name) AS keywords,
              GROUP_CONCAT(DISTINCT c.category_name) AS categories
          FROM 
              researches r 
              LEFT JOIN research_authors ra ON r.research_id = ra.research_id 
              LEFT JOIN authors a ON ra.author_id = a.author_id 
              LEFT JOIN research_keywords rk ON r.research_id = rk.research_id 
              LEFT JOIN keywords k ON rk.keyword_id = k.keyword_id
              LEFT JOIN research_categories rc ON r.research_id = rc.research_id
              LEFT JOIN category c ON rc.category_id = c.category_id
          WHERE 
              r.status = 'approved'
          GROUP BY 
              r.research_id, r.title, r.abstract;`,
        (err, rows) => {
          if (err) {
            console.error("Error fetching documents:", err);
            return;
          }
          cachedDocuments = rows;
          console.log("Documents loaded into memory");
        }
      );
    } catch (error) {
      console.error("Error loading documents:", error);
    }
  }

function getCachedDocuments() {
  return cachedDocuments;
}

module.exports = { loadDocuments, getCachedDocuments };
