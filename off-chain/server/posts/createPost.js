const express = require('express');
const {User, Post} = require('../web3');
const {UserDB, PostDB} = require('../database');
const {jwt_verify} = require("../common");


const router = express.Router();

async function createPost(req, res, decoded) {
    // get user address from req
    const address = req.cookies.user;
    // get user contract from address in database
    const userContractDB = await UserDB.findOne({address: address});
    // get user contract
    const userContract = await User.at(userContractDB.address);
    // check if user is the same as the one in the token
    const userAddress = await userContract.owner();

    if (userAddress.toString().toLowerCase() !== decoded.address.toString().toLowerCase()) {
        res.status(401).send('Invalid token');
        return;
    }
    // create post
    const tx = await userContract.createPost(req.body.title, req.body.content, req.body.price, {from: decoded.address});
    const postAddress = tx.logs[0].address;
    // add post to database
    const post = new PostDB({
        address: postAddress,
        title: req.body.name,
        content: req.body.content,
        price: req.body.price,
        owner: userContract.address,
        author: userContract.address,
        createdAt: Date.now(),
        likes: [],
    });
    await post.save();
    // return post address
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.status(200).send({postAddress: postAddress});
}

// create post OK
router.post('/create-post', async (req, res) => {
    jwt_verify(req, res, createPost);
});

module.exports = router;
