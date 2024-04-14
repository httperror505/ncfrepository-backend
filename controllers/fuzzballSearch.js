const fuzzball = require('fuzzball');
const db = require('../database/db');

const fuzzballSearch = (req, res) => {
    const { query } = req.body;

    // Record the start time
    const startTime = Date.now();

    // Fetch documents from the database
    db.query(`
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
        FROM 
            document d 
        JOIN 
            category c ON d.category_id = c.category_id 
        JOIN 
            doctype dt ON d.doctype_id = dt.doctype_id 
        JOIN 
            department dep ON d.department_id = dep.department_id 
        JOIN 
            course co ON d.course_id = co.course_id
    `, (err, results) => {
        if (err) {
            console.error('Error fetching documents from database: ', err);
            res.status(500).json({ error: 'Fetch Document Endpoint Error' });
            return;
        }

        // Prepare data for fuzzball
        const fuzzballOptions = {
            scorer: fuzzball.token_set_ratio,
            limit: 10, // Adjust the limit according to your needs
            processor: choice => [choice] // Keep the format consistent with Fuse.js
        };

        // Perform the search
        const fuzzballResults = fuzzball.extract(query, results, fuzzballOptions);

        // Sort the search results based on their score (similarity)
        fuzzballResults.sort((a, b) => b[1] - a[1]);

        // Record the end time
        const endTime = Date.now();

        // Calculate the execution time
        const executionTime = endTime - startTime;

        // Log or display the execution time
        console.log('Execution time:', executionTime, 'milliseconds');

        res.json({ results: fuzzballResults });
    });
};

module.exports = { fuzzballSearch };
