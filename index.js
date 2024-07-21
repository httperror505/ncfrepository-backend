const EventEmitter = require("events");
EventEmitter.defaultMaxListeners = 20;

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./database/db");
const {
  authenticateToken,
  isAdmin,
  isNCFUser,
  isNotNCFUser,
} = require("./authentication/middleware");
// User Management
const roleRoutes = require("./routes/Admin/roleRoutes");
const userRoutes = require("./routes/User Management/userRoutes");
const authRoutes = require("./routes/Auth/authRoutes");
// Algorithm
const searchRoutes = require("./routes/Search Engine/searchRoutes");
// CRUD Documents
const documentRoutes = require("./routes/Content Management/uploadRoutes");
const adminRoutes = require("./routes/Admin/adminRoutes");
// Browse Filter
const filterRoutes = require("./routes/Content Filtering/browseRoutes");
// Dashboard
const dashboardRoutes = require("./routes/Content Management/dashboardRoutes");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

const PORT = process.env.PORT;

// Algorithm
app.use("/search", searchRoutes);

// User Management
app.use(roleRoutes);
app.use(userRoutes);
app.use(authRoutes);

// CRUD Documents
app.use(documentRoutes);
app.use(adminRoutes);

// Browse Filter
app.use(filterRoutes);

// Dashboard such as Citations Adding
app.use(dashboardRoutes);

app.get("/", (req, res) => {
  res.json({ Messsage: "NCF Repository Backend Running!" });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
