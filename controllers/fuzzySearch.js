const db = require('../database/db');

// Function to calculate the Levenshtein distance between two strings
function levenshteinDistance(a, b) {
  const distanceMatrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

  for (let i = 0; i <= a.length; i += 1) {
    distanceMatrix[0][i] = i;
  }

  for (let j = 0; j <= b.length; j += 1) {
    distanceMatrix[j][0] = j;
  }

  for (let j = 1; j <= b.length; j += 1) {
    for (let i = 1; i <= a.length; i += 1) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      distanceMatrix[j][i] = Math.min(
        distanceMatrix[j][i - 1] + 1, // deletion
        distanceMatrix[j - 1][i] + 1, // insertion
        distanceMatrix[j - 1][i - 1] + indicator, // substitution
      );
    }
  }

  return distanceMatrix[b.length][a.length];
}

const fuzzySearch = (req, res) => {
  const { query } = req.body;

  const documentQuery = `SELECT r.research_id, r.title, r.publish_date, r.abstract, r.filename, a.author_id, a.author_name, k.keyword_id, k.keyword_name FROM researches r JOIN research_authors ra ON r.research_id = ra.research_id JOIN authors a ON ra.author_id = a.author_id JOIN research_keywords rk ON r.research_id = rk.research_id JOIN keywords k ON rk.keyword_id = k.keyword_id WHERE r.status = 'approved';`;

  
};

module.exports = {fuzzySearch};
