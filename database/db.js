const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
});

db.connect((err) => {
    if (err) {
        console.log('NCF Repository Database: Connection Fail');
        console.log(err);
    } else {
        console.log('NCF Repository Database: Connection OK');
    }
});

module.exports = db;
