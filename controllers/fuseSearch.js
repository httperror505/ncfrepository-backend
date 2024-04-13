const fuzzball = require('fuzzball');
const db = require('../database/db');

const fuzzballSearch = (req, res) => {
    const { query } = req.body;

    // Fetch documents from the database
    const dbQuery = `
        SELECT 
            d.document_id,
            d.title,
            d.author,
            d.publish_date,
            d.abstract,
            d.citation,
            c.category_name,
            dt.doctype_name,
            dep.department_name,
            co.course_name
        FROM document d
        JOIN category c ON d.category_id = c.category_id
        JOIN doctype dt ON d.doctype_id = dt.doctype_id
        JOIN department dep ON d.department_id = dep.department_id
        JOIN course co ON d.course_id = co.course_id
    `;

    db.query(dbQuery, (err, results) => {
        if (err) {
            console.error('Error fetching documents from the database: ', err);
            res.status(500).json({ error: 'Fetch Document Endpoint Error' });
            return;
        }

        // Prepare data for Fuzzball
        const options = {
            scorer: fuzzball.token_sort_ratio, // Use token_sort_ratio scorer for sorting
            processor: fuzzball.full_process, // Use full_process for processing strings
            limit: -1 // Return all results
        };

        // Concatenate document content into a single string
        const documents = results.map(doc => ({
            document_id: doc.document_id,
            content: `${doc.title} ${doc.author} ${doc.abstract}`
        }));

        // Perform the search
        const searchResults = fuzzball.extract(query, documents, options);

        // Sort the search results based on their score (similarity)
        searchResults.sort((a, b) => b[1] - a[1]);

        // Map the search results back to the original document structure
        const mappedResults = searchResults.map(([index, score]) => ({
            item: {
                document_id: results[index].document_id,
                title: results[index].title,
                author: results[index].author,
                publish_date: results[index].publish_date,
                abstract: results[index].abstract,
                citation: results[index].citation,
                category_name: results[index].category_name,
                doctype_name: results[index].doctype_name,
                department_name: results[index].department_name,
                course_name: results[index].course_name
            },
            similarityRatio: score,
            refIndex: index
        }));

        res.json({ results: mappedResults });
    });
};

module.exports = { fuzzballSearch };
