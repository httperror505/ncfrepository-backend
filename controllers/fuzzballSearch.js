const fuzzball = require('fuzzball');
const db = require('../database/db');

const fuzzballSearch = (req, res) => {
    const { searchTerm } = req.body;
    const query = `
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

    db.query(query, (error, results) => {
        if (error) {
            console.error('Error executing query:', error);
            res.status(500).json({ error: 'An error occurred while searching documents' });
            return;
        }

        // Perform fuzzy search and sort results by similarity ratio
        const matchedDocuments = results
            .filter(doc => doc.title) // Filter out documents with undefined titles
            .map((doc, index) => {
                // Ensure doc.title exists before performing operations
                const titleRatio = fuzzball.ratio(searchTerm, doc.title);
                const authorRatio = fuzzball.ratio(searchTerm, doc.author || '');
                const abstractRatio = fuzzball.ratio(searchTerm, doc.abstract || '');

                // Calculate an average similarity ratio for the document
                const avgRatio = (titleRatio + authorRatio + abstractRatio) / 3;

                return {
                    item: {
                        document_id: doc.document_id,
                        title: doc.title,
                        author: doc.author,
                        publish_date: doc.publish_date,
                        abstract: doc.abstract,
                        citation: doc.citation,
                        category_name: doc.category_name,
                        doctype_name: doc.doctype_name,
                        department_name: doc.department_name,
                        course_name: doc.course_name
                    },
                    refIndex: index,
                    similarityRatio: avgRatio // Include similarity ratio for reference
                };
            });

        // Adjust the threshold value here (e.g., 70)
        const threshold = 75;
        const filteredDocuments = matchedDocuments.filter(doc => doc.similarityRatio >= threshold);

        // Sort the filtered documents by similarity ratio
        filteredDocuments.sort((a, b) => b.similarityRatio - a.similarityRatio);

        res.json({ results: filteredDocuments });
    });
};

module.exports = { fuzzballSearch };
