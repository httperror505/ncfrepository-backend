const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database/db');
const {authenticateToken, isAdmin, isNCFUser, isNotNCFUser } = require('../authentication/middleware');

const router = express.Router();

router.get('/category', async (req, res) => {
    try {
        const getDepartmentsQuery = 'SELECT * FROM category';
        const [departments] = await db.promise().execute(getDepartmentsQuery);

        res.status(200).json({departments});

    } catch (error) {
        console.error('Error Get Departments: ', error);
        res.status(500).json({error: 'Get Departments Endpoint Error!'});
    }

});

router.get('/departments/:department_id', async (req, res) => {
    try {
        const department_id = req.params.department_id;

        const getDepartmentQuery = 'SELECT * FROM department WHERE department_id = ?';
        const [department] = await db.promise().execute(getDepartmentQuery, [department_id]);

        if (department.length === 0) {
            return res.status(404).json({error: 'Department not found!'});
        }

        res.status(200).json({department});

    } catch (error) {
        console.error('Error Get Department: ', error);
        res.status(500).json({error: 'Get Department Endpoint Error!'});
    }

});

module.exports = router;