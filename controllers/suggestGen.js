const Fuse = require("fuse.js");
const { getCachedDocuments } = require("../config/cache");

const getSuggestions = (req, res) => {
  const { query } = req.body;

  const cachedDocuments = getCachedDocuments();

//   console.log(query, cachedDocuments);

  // Check if the cachedDocuments is empty (e.g., it might not have been loaded yet)
  if (cachedDocuments.length === 0) {
    return res.status(500).json({ error: "No documents available in memory." });
  }

  // Prepare data for Fuse.js
  const options = {
    keys: ["title", "keywords", "categories", "authors", "abstract"],
    threshold: 0.4, // Adjust if needed hehe
    ignoreCase: true, 
  };

  const fuse = new Fuse(cachedDocuments, options);

  // Perform the search
  const searchResults = fuse.search(query).map((result) => result.item);

  // Sort the search results based on their score (similarity)
  searchResults.sort((a, b) => b.score - a.score);

  // Send the search results as response
  res.json({ results: searchResults });
};

module.exports = { getSuggestions };
