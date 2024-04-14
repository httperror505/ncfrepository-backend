const db = require('../database/db');
const Fuse = require('fuse.js');

const fuseSearch = (req, res) => {

    const { query } = req.body;

    // Fetch documents from database
    db.query('SELECT d.document_id,d.title, d.author, d.publish_date, d.abstract, d.citation, c.category_name, dt.doctype_name, dep.department_name,co.course_name FROM document d JOIN category c ON d.category_id = c.category_id JOIN doctype dt ON d.doctype_id = dt.doctype_id JOIN department dep ON d.department_id = dep.department_id JOIN course co ON d.course_id = co.course_id', (err, results) => {
      if (err) {
        console.error('Error fetching documents from database: ', err);
        res.status(500).json({ error: 'Fetch Document Endpoint Error' });
        return;
      }

      // Prepare data for Fuse.js
      const options = {
        keys: ['title', 'author', 'abstract'], // Fields to search in documents
        threshold: 0.45,// Adjust the threshold according to your needs
        ignoreCase: true // Make the search case-insensitive
      };
      const fuse = new Fuse(results, options);

      // Perform the search
      const searchResults = fuse.search(query);

        // Sort the search results based on their score (similarity)
        searchResults.sort((a, b) => b.score - a.score);

        res.json({ results: searchResults });
    });
};

module.exports = {fuseSearch}