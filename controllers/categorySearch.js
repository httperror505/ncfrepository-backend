const db = require("../database/db");
const Fuse = require("fuse.js");

const categorySearch = (req, res) => {
  const { query } = req.body;

  // Fetch documents from the database with necessary joins
  const fetchAuthorsQuery = `SELECT * FROM category`;

  db.query(fetchAuthorsQuery, (err, results) => {
    if (err) {
      console.error("Error fetching category from database: ", err);
      res.status(500).json({ error: "Fetch Authors Endpoint Error" });
      return;
    }

    // Prepare data for Fuse.js
    const options = {
      keys: ["category_name"], // Fields to search in documents
      threshold: 0.4, // Adjust the threshold according to your needs
      ignoreCase: true, // Make the search case-insensitive
    };
    const fuse = new Fuse(results, options);

    // Perform the search
    const categoryResults = fuse.search(query).map((result) => result.item);

    // Sort the search results based on their score (similarity)
    categoryResults.sort((a, b) => b.score - a.score);

    res.json({ results: categoryResults });
  });
};

module.exports = { categorySearch };
