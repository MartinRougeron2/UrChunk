const jwt = require("jsonwebtoken");
const express = require('express');
const {User, Post} = require('../web3');
const {UserDB, PostDB} = require('../database');
const {jwt_verify} = require("../common");


const router = express.Router();

async function myUsers(req, res, decoded) {
    const users = await UserDB.find({owner: decoded.address}).sort({createdAt: -1});
    res.status(200).json({users});
}

// check jwt token OK
router.get('/my-users', (req, res) => {
    jwt_verify(req, res, myUsers);
});

module.exports = router;