const jwt = require("jsonwebtoken");
const express = require('express');
const {User, Post} = require('../web3');
const {UserDB, PostDB} = require('../database');


const router = express.Router();

// follow user OK
router.post('/follow-user', async (req, res) => {
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
        // get user address from req
        const userAddress = req.cookies.user;
        // get user contract
        const userContract = await User.at(userAddress);
        // get user owner
        const userOwner = await userContract.owner();
        // check if user is the same as the one in the token
        console.log(userOwner.toString().toLowerCase());
        console.log(decoded.address.toString().toLowerCase());
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
    });
});

module.exports = router;