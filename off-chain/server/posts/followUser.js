const express = require('express');
const {User, Post} = require('../web3');
const {UserDB, PostDB} = require('../database');
const {jwt_verify} = require("../common");


const router = express.Router();

async function followUser(req, res, decoded) {
    const userAddress = req.cookies.user;
    // get user contract
    const userContract = await User.at(userAddress);
    // get user owner
    const userOwner = await userContract.owner();
    // check if user is the same as the one in the token
    if (userOwner.toString().toLowerCase() !== decoded.address.toString().toLowerCase()) {
        res.status(401).send('Invalid token');
        return;
    }
    const addressToFollow = req.body.addressToFollow;
    // follow user
    await userContract.follow(addressToFollow, {from: decoded.address});
    // update user in database
    await UserDB.updateOne({address: userAddress}, {$push: {followers: decoded.address}});
    // return success
    res.status(200).send('Success');
}

// follow user OK
router.post('/follow-user', async (req, res) => {
    jwt_verify(req, res, followUser);
});

module.exports = router;
