const express = require('express');
const {User, Post} = require('../web3');
const {UserDB, PostDB} = require('../database');
const {jwt_verify} = require("../common");

const router = express.Router();

async function likePost(req, res, decoded) {
    // get post address from req
    const postAddress = req.body.postAddress;
    // get post contract
    const postContract = await Post.at(postAddress);
    // get post owner
    const postOwner = await postContract.owner();
    // get user from post owner
    const user = await User.at(postOwner);
    // get user owner
    const userOwner = await user.owner();
    // check if user is the same as the one in the token
    if (userOwner.toString().toLowerCase() !== decoded.address.toString().toLowerCase()) {
        res.status(401).send('Invalid token');
        return;
    }
    // like post
    await postContract.like(user.address, {from: decoded.address});
    // update post in database
    await PostDB.updateOne({address: postAddress}, {$push: {likes: decoded.address}});
    // return success
    res.status(200).send('Success');
}

// like post OK
router.post('/like-post', async (req, res) => {
    jwt_verify(req, res, likePost);
});

module.exports = router;
