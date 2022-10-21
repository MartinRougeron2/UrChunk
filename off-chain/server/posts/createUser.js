const express = require('express');
const {User, Post} = require('../web3');
const {UserDB, PostDB} = require('../database');
const {jwt_verify} = require("../common");


const router = express.Router();

async function createUser(req, res, decoded) {
    // create user
    const tx = await User.new(req.body.name, req.body.email, req.body.price, {from: decoded.address});
    console.log(tx.address);
    const userAddress = tx.address;
    // add user to database
    const user = new UserDB({
        address: userAddress,
        name: req.body.name,
        content: req.body.content,
        price: req.body.price,
        owner: decoded.address,
    });
    await user.save();
    // return user address
    res.status(200).send({userAddress: userAddress});
}

// create user OK
router.post('/create-user', async (req, res) => {
    jwt_verify(req, res, createUser);
});

module.exports = router;