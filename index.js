const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./database/db');
const roleRoutes = require('./routes/roleRoutes');
const userRoutes = require('./routes/userRoutes');
const searchRoutes = require('./routes/searchRoutes');


const app = express();
app.use(bodyParser.json());
app.use(cors());

const PORT = process.env.PORT;

app.use('/search', searchRoutes);

app.get('/', userRoutes, roleRoutes, (req, res) => {
    res.json({Messsage: 'NCF Repository Backend Running!'});
});

app.listen(PORT, ()=> {
    console.log(`Server is running on http://localhost:${PORT}`);
});