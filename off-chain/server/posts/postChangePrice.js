const express = require('express');
const {User, Post} = require('../web3');
const {UserDB, PostDB} = require('../database');
const {jwt_verify} = require("../common");


const router = express.Router();

async function changePrice(req, res, decoded) {
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
}

// post change price OK
router.post('/post-change-price', async (req, res) => {
    jwt_verify(req, res, changePrice);
});

module.exports = router;
