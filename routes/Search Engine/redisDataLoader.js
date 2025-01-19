const db = require('../../database/db');
const redisClient = require('../../database/redis');

const loadDocumentsToRedis = async () => {
    try {
      // Fetch documents from the database
      const [documents] = await db.query('SELECT research_id, title FROM researches WHERE status = "approved"');
      
      // Store documents in Redis
      await redisClient.set('documents', JSON.stringify(documents), {
        EX: 3600, // Optional: Set expiration time in seconds (e.g., 1 hour)
      });
  
      console.log('Documents loaded into Redis successfully');
    } catch (err) {
      console.error('Error loading documents into Redis:', err);
    }
  };
  
  module.exports = { loadDocumentsToRedis };