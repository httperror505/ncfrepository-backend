const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database/db');
const {authenticateToken} = require('../authentication/middleware');

const router = express.Router();

// To be change ang results format ng mga functions

// Browse by departments
router.get('/browse/departments/:department_id', async(req, res) =>{

    try {

        const department_id = req.params.department_id;

        if (!department_id) {
            return res.status(400).json({error: 'Please provide department id'});
        }

        const getDepartmentQuery = 'SELECT * FROM department WHERE department_id = ?'; 
        const [department] = await db.promise().execute(getDepartmentQuery, [department_id]);

        if (department.length === 0) {
            return res.status(404).json({error: 'Department not found!'});
        }

        const getDepartmentDocumentsQuery = 'SELECT * FROM document WHERE department_id = ?';
        const [departmentDocuments] = await db.promise().execute(getDepartmentDocumentsQuery, [department_id]);

        res.status(200).json({department, departmentDocuments});

    } catch (error) {
        console.error('Error getting document from a department:', error);
        res.status(500).json({error: 'Departments Endpoint Error!'});
    }

});

// Browse by course
router.get('/browse/courses/:course_id', async(req, res) =>{

    try {

        const course_id = req.params.course_id;

        if(!course_id) {
            return res.status(400).json({error: 'Please provide course id'});
        }

        const getCourseQuery = 'SELECT * FROM course WHERE course_id = ?';
        const [course] = await db.promise().execute(getCourseQuery, [course_id]);

        if (course.length === 0) {
            return res.status(404).json({error: 'Course not found!'});
        }

        const getCourseDocumentsQuery = 'SELECT * FROM document WHERE course_id = ?';
        const [courseDocuments] = await db.promise().execute(getCourseDocumentsQuery, [course_id]);

        res.status(200).json({course, courseDocuments});
    } catch (error) {
        console.error('Error getting document from a course:', error);
        res.status(500).json({error: 'Courses Endpoint Error!'});
    }

});


// Browse by category
router.get('/browse/categories/:category_id', async(req, res) => {

    try {

        const category_id = req.params.category_id;

        if (!category_id) {
            return res.status(400).json({error: 'Please provide category id'});
        }

        const getCategoryQuery = 'SELECT * FROM category WHERE category_id = ?';
        const [category] = await db.promise().execute(getCategoryQuery, [category_id]);

        if (category.length === 0) {
            return res.status(404).json({error: 'Category not found!'});
        }

        const getCategoryDocumentsQuery = 'SELECT * FROM document WHERE category_id = ?';
        const [categoryDocuments] = await db.promise().execute(getCategoryDocumentsQuery, [category_id]);

        res.status(200).json({category, categoryDocuments});

    } catch (error) {
        console.error('Error getting document from a category:', error);
        res.status(500).json({error: 'Categories Endpoint Error!'});
    }

});

module.exports = router;