const mysql = require('mysql');
require('dotenv').config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.PORT,
    connectTimeout: 10000 // Set the timeout to 10 seconds
});

db.connect((err) => {
    console.log(process.env.DB_HOST, process.env.PORT, process.env.DB_USER, process.env.DB_PASSWORD, process.env.DB_DATABASE);
    if (err) {
        console.log('NCF Repository Database: Connection Fail');
        console.log(err);
    } else {
        console.log('NCF Repository Database: Connection OK');
    }
});

module.exports = db;
