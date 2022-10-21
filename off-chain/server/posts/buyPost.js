const express = require('express');
const {User, Post} = require('../web3');
const {UserDB, PostDB} = require('../database');
const {jwt_verify} = require('../common');

const router = express.Router();

async function buyPost(req, res, decoded) {
    // get post address from req
    const postAddress = req.body.postAddress;
    // get user address from req
    const userAddress = req.cookies.user;
    // get post contract
    const postContract = await Post.at(postAddress);
    // get post owner
    const postOwner = await postContract.owner();
    // get user contract
    const userContract = await User.at(userAddress);
    // get user owner
    const userOwner = await userContract.owner();
    // check if user is the same as the one in the token
    if (userOwner.toString().toLowerCase() !== decoded.address.toString().toLowerCase()) {
        res.status(401).send('Invalid token');
        return;
    }
    // buy post
    await userContract.buyPost(postAddress, {from: decoded.address, value: req.body.price});
    // update post in database
    await PostDB.updateOne({address: postAddress}, {owner: decoded.address});
    // update old owner user in database
    await UserDB.updateOne({address: postOwner}, {$pull: {posts: postAddress}});
    // update new owner user in database
    await UserDB.updateOne({address: decoded.address}, {$push: {posts: postAddress}});
    // return success
    res.status(200).send('Success');
}

// buy post OK
router.post('/buy-post', async (req, res) => {
    jwt_verify(req, res, buyPost);
});

module.exports = router;