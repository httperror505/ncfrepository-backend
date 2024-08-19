const db = require("../database/db");

const calculateSimilarity = (str1, str2) => {
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

            const uniqueResearchIds = new Set();
            const filteredResults = [];

            results.forEach(item => {
                if (uniqueResearchIds.has(item.research_id)) {
                    return;
                }

                const titleSimilarity = calculateSimilarity(query, item.title);
                const abstractSimilarity = calculateSimilarity(query, item.abstract);
                const authorSimilarity = calculateSimilarity(query, item.author_name);
                const keywordSimilarity = calculateSimilarity(query, item.keyword_name);

                if (
                    titleSimilarity > 0.3 ||
                    abstractSimilarity > 0.3 ||
                    authorSimilarity > 0.3 ||
                    keywordSimilarity > 0.3
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
                    calculateSimilarity(query, a.author_name),
                    calculateSimilarity(query, a.keyword_name)
                );
                const bMaxSimilarity = Math.max(
                    calculateSimilarity(query, b.title),
                    calculateSimilarity(query, b.abstract),
                    calculateSimilarity(query, b.author_name),
                    calculateSimilarity(query, b.keyword_name)
                );
                return bMaxSimilarity - aMaxSimilarity;
            });

            res.status(200).json({ results: filteredResults });
        }
    );
};

module.exports = { ManualAlgorithm };
