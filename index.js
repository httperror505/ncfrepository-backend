const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./database/db');
const { authenticateToken, isAdmin, isNCFUser, isNotNCFUser } = require('./authentication/middleware');
// User Management
const roleRoutes = require('./routes/roleRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
// Algorithm
const searchRoutes = require('./routes/searchRoutes');
// CRUD Documents
const documentRoutes = require('./routes/documentRoutes');
// Browse Filter
const filterRoutes = require('./routes/filterRoutes');
// Dashboard
const dashboardRoutes = require('./routes/dashboardRoutes');
require('dotenv').config();


const app = express();
app.use(bodyParser.json());
app.use(cors());

const PORT = process.env.PORT;

// Algorithm
app.use('/search', searchRoutes);

// User Management
app.use(roleRoutes);
app.use(userRoutes);
app.use(authRoutes);

// CRUD Documents
app.use(documentRoutes);

// Browse Filter
app.use(filterRoutes);

// Dashboard such as Citations Adding
app.use(dashboardRoutes);

app.get('/', (req, res) => {
    res.json({Messsage: 'NCF Repository Backend Running!'});
});

app.listen(PORT, ()=> {
    console.log(`Server is running on http://localhost:${PORT}`);
});