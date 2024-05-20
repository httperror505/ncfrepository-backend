const db = require("../database/db");

// Fuzzy search algorithm function using Levenshtein distance
const fuzzySearchAlgorithm = (searchTerm, targetString, threshold) => {
    // Convert both strings to lowercase for case-insensitive comparison
    const s = searchTerm.toLowerCase();
    const t = targetString.toLowerCase();
    
    // Create a matrix to store Levenshtein distances
    const matrix = [];
    for (let i = 0; i <= s.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= t.length; j++) {
        matrix[0][j] = j;
    }
    
    // Calculate Levenshtein distance
    for (let i = 1; i <= s.length; i++) {
        for (let j = 1; j <= t.length; j++) {
            const cost = s[i - 1] === t[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,     // deletion
                matrix[i][j - 1] + 1,     // insertion
                matrix[i - 1][j - 1] + cost // substitution
            );
        }
    }
    
    // Return true if the Levenshtein distance is below the threshold, false otherwise
    return matrix[s.length][t.length] <= threshold;
};


const Levenshtein = (req, res) => {
    const { query } = req.body;

    // Fetch documents from database with necessary joins
    db.query(
        `SELECT
            r.research_id,
            r.title,
            r.publish_date,
            r.abstract,
            r.filename,
            a.author_id,
            a.author_name,
            k.keyword_id,
            k.keyword_name
        FROM
            researches r
        JOIN
            research_authors ra ON r.research_id = ra.research_id
        JOIN
            authors a ON ra.author_id = a.author_id
        JOIN
            research_keywords rk ON r.research_id = rk.research_id
        JOIN
            keywords k ON rk.keyword_id = k.keyword_id
        WHERE
            r.status = 'approved'`,
        (err, results) => {
            if (err) {
                console.error("Error fetching documents from database: ", err);
                res.status(500).json({ error: "Fetch Document Endpoint Error" });
                return;
            }

            // Filter results using fuzzy search algorithm
            const filteredResults = results.filter(result =>
                fuzzySearchAlgorithm(query, result.title) ||
                fuzzySearchAlgorithm(query, result.author_name) ||
                fuzzySearchAlgorithm(query, result.keyword_name) ||
                fuzzySearchAlgorithm(query, result.abstract)
            );

            res.status(200).json(filteredResults);
        }
    );
};

module.exports = { Levenshtein };
