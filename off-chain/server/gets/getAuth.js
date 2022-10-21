const jwt = require("jsonwebtoken");
const express = require('express');
const {User, Post} = require('../web3');
const {UserDB, PostDB} = require('../database');


const router = express.Router();

// check jwt token OK
router.get('/check-auth', (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        res.status(401).json({message: "Unauthorized"});
    } else {
        jwt.verify(token, 'secret', (err, decoded) => {
            if (err) {
                res.status(401).json({message: "Unauthorized"});
            } else {
                res.status(200).json({message: "Authorized"});
            }
        });
    }
});

module.exports = router;