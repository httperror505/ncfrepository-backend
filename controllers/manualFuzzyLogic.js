const { getCachedDocuments } = require("../config/cache");

// Reference: https://www.geeksforgeeks.org/fuzzy-logic-introduction/

// Sir here's the reference for the similarity: https://docs.aws.amazon.com/neptune-analytics/latest/userguide/jaccard-similarity.html#:~:text=The%20Jaccard%20similarity%20algorithm%20measures,the%20size%20of%20their%20union.
// Jaccard Similarity Function
function jaccardSimilarity(str1, str2) {
    const set1 = new Set(str1.toLowerCase().split(" "));
    const set2 = new Set(str2.toLowerCase().split(" "));
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return intersection.size / union.size;
}

// First, fuzzify the input po to make sure na may similarity score tayo for each field
// Fuzzification: Calculate similarity for each field
function fuzzify(query, field) {
    return jaccardSimilarity(query, field);
}

// Making the verdict
// Inference Engine: Rules for evaluating similarity (example with simple thresholds)
function inferSimilarity(similarityScore) {
    if (similarityScore > 0.8) return "high"; // High similarity
    if (similarityScore > 0.5) return "medium"; // Medium similarity
    return "low"; // Low similarity
}

// Defuzzification: Convert fuzzy values into crisp scores for ranking
function defuzzify(fuzzyMatch) {
    switch (fuzzyMatch) {
        case "high":
            return 1; // Highest score for high similarity
        case "medium":
            return 0.5; // Medium score
        case "low":
            return 0.1; // Low score
        default:
            return 0;
    }
}

// Main Fuzzy Logic Search Function
const FuzzyLogic = (req, res) => {
    const { query } = req.body;
    const cachedDocuments = getCachedDocuments();

    // Check if the cachedDocuments is empty
    if (cachedDocuments.length === 0) {
        return res.status(500).json({ error: "No documents available in memory." });
    }

    // Step 1: Process each document
    const documentScores = cachedDocuments.map((doc) => {
        let totalScore = 0;
        let fieldCount = 0;

        // Check each field in the document (title, author, keywords, categories, abstract)
        const fields = ['title', 'author', 'keywords', 'categories', 'abstract'];
        fields.forEach(field => {
            const similarityScore = fuzzify(query, doc[field] || "");
            const fuzzyMatch = inferSimilarity(similarityScore);
            totalScore += defuzzify(fuzzyMatch); // Add the score for this field
            fieldCount++; // Count how many fields we are comparing

        });

        // Calculate the average score for the document
        const averageScore = totalScore / fieldCount;
        return { doc, score: averageScore };
    });

    // Step 2: Sort documents by score (in descending order)
    const sortedResults = documentScores.sort((a, b) => b.score - a.score);

    // for suggestions, perfect ni but not for main search algo itself
    // // Step 3: Return the top results
    // const topResults = sortedResults.slice(0, 5); // Return top 5 results

    // Return the results to the client
    return res.status(200).json({ results: sortedResults });
};

module.exports = { FuzzyLogic };
