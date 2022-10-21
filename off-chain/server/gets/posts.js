const jwt = require("jsonwebtoken");
const express = require('express');
const {User, Post} = require('../web3');
const {UserDB, PostDB} = require('../database');
const {jwt_verify} = require("../common");


const router = express.Router();

// check jwt token OK
router.get('/posts', (req, res) => {
    jwt_verify(req, res, async () => {
        const posts = await PostDB.find({}).sort({createdAt: -1});
        res.status(200).json({posts});
    });
});

module.exports = router;