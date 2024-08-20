const db = require("../database/db");

const calculateSimilarity = (str1, str2) => {
    if (!str1 || !str2) {
        return 0; // Return 0 similarity if either string is undefined or null
    }

    str1 = str1.toLowerCase();
    str2 = str2.toLowerCase();

    // const matchThreshold = 0.5; // Adjust this to make the search stricter or more lenient

    let matches = 0;
    const len = Math.min(str1.length, str2.length);

    for (let i = 0; i < len; i++) {
        if (str1[i] === str2[i]) {
            matches++;
        }
    }

    return matches / len;
};

const ManualAlgorithm = (req, res) => {
    const { query } = req.body;

    db.query(
        `SELECT 
            r.research_id, 
            r.title, 
            r.publish_date, 
            r.abstract, 
            r.filename, 
            GROUP_CONCAT(DISTINCT a.author_name) AS authors, 
            GROUP_CONCAT(DISTINCT k.keyword_name) AS keywords 
        FROM 
            researches r 
            LEFT JOIN research_authors ra ON r.research_id = ra.research_id 
            LEFT JOIN authors a ON ra.author_id = a.author_id 
            LEFT JOIN research_keywords rk ON r.research_id = rk.research_id 
            LEFT JOIN keywords k ON rk.keyword_id = k.keyword_id 
        WHERE 
            r.status = 'approved'
        GROUP BY 
            r.research_id, r.title, r.publish_date, r.abstract, r.filename;`,
        (err, results) => {
            if (err) {
                console.error("Error fetching documents from database: ", err);
                res.status(500).json({ error: "Fetch Document Endpoint Error" });
                return;
            }

            const uniqueResearchIds = new Set();
            const filteredResults = [];

            // console.log(results);
            // console.log(results.map(item => item.authors));

            results.forEach(item => {
                if (uniqueResearchIds.has(item.research_id)) {
                    return;
                }
                
                const titleSimilarity = calculateSimilarity(query, item.title);
                const abstractSimilarity = calculateSimilarity(query, item.abstract);
                const authorSimilarity = calculateSimilarity(query, item.authors);
                const keywordSimilarity = calculateSimilarity(query, item.keywords);

                if (
                    titleSimilarity > 0.4 ||
                    abstractSimilarity > 0.4 ||
                    authorSimilarity > 0.4 ||
                    keywordSimilarity > 0.4
                ) {
                    uniqueResearchIds.add(item.research_id);
                    filteredResults.push(item);
                }
            });

            // Sort results based on the highest similarity
            filteredResults.sort((a, b) => {
                const aMaxSimilarity = Math.max(
                    calculateSimilarity(query, a.title),
                    calculateSimilarity(query, a.abstract),
                    calculateSimilarity(query, a.authors),
                    calculateSimilarity(query, a.keywords)
                );
                const bMaxSimilarity = Math.max(
                    calculateSimilarity(query, b.title),
                    calculateSimilarity(query, b.abstract),
                    calculateSimilarity(query, b.authors),
                    calculateSimilarity(query, b.keywords)
                );
                return bMaxSimilarity - aMaxSimilarity;
            });
            // console.log(filteredResults);
            res.status(200).json({ results: filteredResults });
        }
    );
};

module.exports = { ManualAlgorithm };
