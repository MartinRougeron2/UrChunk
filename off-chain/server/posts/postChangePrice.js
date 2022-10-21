const jwt = require("jsonwebtoken");
const express = require('express');
const {User, Post} = require('../web3');
const {UserDB, PostDB} = require('../database');


const router = express.Router();

// post change price OK
router.post('/post-change-price', async (req, res) => {
    // check jwt token
    const token = req.cookies.token;
    if (!token) {
        res.status(401).send('No token provided');
        return;
    }
    jwt.verify(token, 'secret', async (err, decoded) => {
        if (err) {
            res.status(401).send('Invalid token');
            return;
        }
        // get post address from req
        const postAddress = req.body.postAddress;
        // get post contract
        const postContract = await Post.at(postAddress);
        // get post owner
        const postOwner = await postContract.owner();
        // get user owner of the post
        const userAddress = await (await User.at(postOwner)).owner();
        // check if user is the same as the one in the token
        if (userAddress.toString().toLowerCase() !== decoded.address.toString().toLowerCase()) {
            res.status(401).send('Invalid token');
            return;
        }
        // change post price
        await postContract.changePrice(req.body.price, {from: decoded.address});
        // update post in database
        await PostDB.updateOne({address: postAddress}, {price: req.body.price});
        // return success
        res.status(200).send('Success');
    });
});

module.exports = router;
