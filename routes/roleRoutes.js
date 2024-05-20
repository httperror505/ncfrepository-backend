const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database/db');
const {authenticateToken} = require('../authentication/middleware');

const router = express.Router();

// ----ROLES DATA----

// retrieve all roles
router.get('/roles/all', async(req, res) =>{
    try{
        const getAllRolesQuery = 'SELECT role_id, role_name FROM roles';
        const[rows] = await db.promise().execute(getAllRolesQuery);

        res.status(200).json({roles: rows});
    }catch(error){
        console.error('Error getting roles:', error);
        res.status(500).json({error: 'All Roles Endpoint Error!'});
    }
});

// retrieve role by id
router.get('/roles/:role_id', async(req, res)=>{
    let role_id = req.params.role_id;

    if(!role_id){
        return res.status(400).send({error: true, message: 'Please provide role id'});
    }
    try{
        db.query('SELECT role_id, role_name FROM role WHERE role_id = ?', role_id, (err, result)=>{
            if(err){
                console.error('Error fetching data', err);
                res.status(500).json({message: 'Internal Server Error'});
            }else{
                res.status(200).json({result});
            }
        });
    }catch(error){
        console.error('Error loading role:', error);
        res.status(500).json({error: 'Individual Role Endpoint Error!'});
    }
});

module.exports = router;