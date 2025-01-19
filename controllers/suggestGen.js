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
    keys: ["title", "abstract"], // Fields to search in the documents (you can add more fields like 'authors' or 'keywords' as needed)
    threshold: 0.4, // Adjust the threshold according to your needs
    ignoreCase: true, // Make the search case-insensitive
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
