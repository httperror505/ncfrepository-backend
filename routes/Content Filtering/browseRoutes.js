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

// Browse all categories
router.get('/categories/all', async (req, res) => {
  try {
    const getAllCategoriesQuery = "SELECT * FROM category";
    const [categories] = await db.promise().execute(getAllCategoriesQuery);
    res.status(200).json({ categories });
  } catch (err) {
    console.error("Error getting categories:", err);
    res.status(500).json({ error: "All Categories Endpoint Error!" });
  }
})

// Browse by category
router.get("/category/:category_id", async (req, res) => {
  try {
    const category_id = req.params.category_id;

    if (!category_id) {
      return res.status(400).json({ error: "Please provide category id" });
    }

    const getCategoryQuery = "SELECT * FROM category WHERE category_id = ?";
    const [category] = await db
      .promise()
      .execute(getCategoryQuery, [category_id]);

    if (category.length === 0) {
      return res.status(404).json({ error: "Category not found!" });
    }

    const getCategoryDocumentsQuery = `
            SELECT r.*,
            GROUP_CONCAT(DISTINCT a.author_name) AS authors, 
            GROUP_CONCAT(DISTINCT k.keyword_name) AS keywords,
            GROUP_CONCAT(DISTINCT c.category_name) AS categories,
            c.total_cites AS citeCount,
            d.total_downloads AS downloadCount,
            v.total_views AS viewCount
            FROM researches r 
            LEFT JOIN research_authors ra ON r.research_id = ra.research_id 
            LEFT JOIN authors a ON ra.author_id = a.author_id 
            LEFT JOIN research_keywords rk ON r.research_id = rk.research_id 
            LEFT JOIN keywords k ON rk.keyword_id = k.keyword_id
            LEFT JOIN research_categories rc ON r.research_id = rc.research_id
            LEFT JOIN category c ON rc.category_id = c.category_id
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
            WHERE rc.category_id = ?
            GROUP BY 
            r.research_id, 
            r.title, 
            r.publish_date, 
            r.abstract, 
            r.filename,
            c.total_cites, 
            d.total_downloads, 
            v.total_views
      `;
    const [categoryDocuments] = await db
      .promise()
      .execute(getCategoryDocumentsQuery, [category_id]);

    res.status(200).json({ category: category[0], categoryDocuments });
  } catch (error) {
    console.error("Error getting documents from a category:", error);
    res.status(500).json({ error: "Categories Endpoint Error!" });
  }
});

// Browse all keywords for mapping suggestions
router.get("/keywords/all", async (req, res) => {
  try {
    const getAllKeywordsQuery = "SELECT keyword_id, keyword_name FROM keywords ORDER BY keyword_name ASC";
    const [keywords] = await db.promise().execute(getAllKeywordsQuery);
    res.status(200).json({ keywords });
  } catch (error) {
    console.error("Error getting all keywords:", error);
    res.status(500).json({ error: "Keywords Endpoint Error!" });
  }
})

// Browse by keywords
router.get("/keywords/:keyword_name", async (req, res) => {
  try {
    const keyword_name = req.params.keyword_name; // Extract keyword_name from params

    if (!keyword_name) {
      return res.status(400).json({ error: "Please provide a keyword name" });
    }

    // Query to fetch matching keywords using the LIKE operator
    const getKeywordDocumentsQuery = `
      SELECT r.*, 
        GROUP_CONCAT(DISTINCT a.author_name) AS authors, 
        GROUP_CONCAT(DISTINCT k.keyword_name) AS keywords,
        GROUP_CONCAT(DISTINCT c.category_name) AS categories,
        c.total_cites AS citeCount,
        d.total_downloads AS downloadCount,
        v.total_views AS viewCount
      FROM researches r 
      LEFT JOIN research_authors ra ON r.research_id = ra.research_id 
      LEFT JOIN authors a ON ra.author_id = a.author_id 
      LEFT JOIN research_keywords rk ON r.research_id = rk.research_id 
      LEFT JOIN keywords k ON rk.keyword_id = k.keyword_id 
      LEFT JOIN research_categories rc ON r.research_id = rc.research_id
            LEFT JOIN category c ON rc.category_id = c.category_id
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
      WHERE k.keyword_name LIKE ?
      GROUP BY 
            r.research_id, 
            r.title, 
            r.publish_date, 
            r.abstract, 
            r.filename,
            c.total_cites, 
            d.total_downloads, 
            v.total_views
    `;

    // Add wildcards around the keyword_name for the LIKE clause
    const searchKeyword = `%${keyword_name}%`;

    const [keywordDocuments] = await db.promise().execute(getKeywordDocumentsQuery, [searchKeyword]);

    // If no documents found, return a not found error
    if (keywordDocuments.length === 0) {
      return res.status(404).json({ error: "No documents found for the given keyword!" });
    }

    res.status(200).json({ keywordDocuments });
  } catch (error) {
    console.error("Error getting documents for a keyword:", error);
    res.status(500).json({ error: "Keywords Endpoint Error!" });
  }
});



// Browse by authors
router.get("/authors/:author_id", async (req, res) => {
  try {
    const author_id = req.params.author_id;

    if (!author_id) {
      return res.status(400).json({ error: "Please provide author id" });
    }

    const getAuthorQuery = "SELECT * FROM authors WHERE author_id = ?";
    const [author] = await db.promise().execute(getAuthorQuery, [author_id]);

    if (author.length === 0) {
      return res.status(404).json({ error: "Author not found!" });
    }

    const getAuthorDocumentsQuery = `
          SELECT r.* 
          FROM researches r
          JOIN research_authors ra ON r.research_id = ra.research_id
          WHERE ra.author_id = ?
      `;
    const [authorDocuments] = await db
      .promise()
      .execute(getAuthorDocumentsQuery, [author_id]);

    res.status(200).json({ author: author[0], authorDocuments });
  } catch (error) {
    console.error("Error getting documents from an author:", error);
    res.status(500).json({ error: "Authors Endpoint Error!" });
  }
});

// Endpoint to fetch authors based on query
router.get("/authors", async (req, res) => {
  try {
    const { query } = req.query;
    const [authors] = await db
      .promise()
      .query("SELECT author_name FROM authors WHERE author_name LIKE ?", [
        `%${query}%`,
      ]);
    res.json(authors.map((author) => author.author_name));
  } catch (error) {
    console.error("Error fetching authors:", error);
    res.status(500).json({ error: "Failed to fetch authors" });
  }
});

// Endpoint to fetch keywords based on query
router.get("/keywords/", async (req, res) => {
  try {
    const { query } = req.query;
    const [keywords] = await db
      .promise()
      .query("SELECT keyword_name FROM keywords WHERE keyword_name LIKE ?", [
        `%${query}%`,
      ]);
    res.json(keywords.map((keyword) => keyword.keyword_name));
  } catch (error) {
    console.error("Error fetching keywords:", error);
    res.status(500).json({ error: "Failed to fetch keywords" });
  }
});

// Route to get all authors
router.get("/all/authors", async (req, res) => {
  try {
    const [authors] = await db
      .promise()
      .execute("SELECT author_id, author_name FROM authors");
    res.json(authors);
  } catch (error) {
    console.error("Error fetching authors:", error);
    res.status(500).json({ error: "Error fetching authors" });
  }
});

// Route to get all keywords
router.get("/all/keywords", async (req, res) => {
  try {
    const [keywords] = await db
      .promise()
      .execute("SELECT keyword_id, keyword_name FROM keywords");
    res.json(keywords);
  } catch (error) {
    console.error("Error fetching keywords:", error);
    res.status(500).json({ error: "Error fetching keywords" });
  }
});




module.exports = router;
