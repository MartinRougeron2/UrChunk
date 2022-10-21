const jwt = require("jsonwebtoken");
const express = require('express');
const {User, Post} = require('../web3');
const {UserDB, PostDB} = require('../database');


const router = express.Router();

// update user email OK
router.post('/update-email', async (req, res) => {
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
        // get user address from cookies
        const address = req.cookies.user;
        // get user contract
        const userContract = await User.at(address);
        // check if user is the same as the one in the token
        const userAddress = await userContract.owner();
        if (userAddress.toString().toLowerCase() !== decoded.address.toString().toLowerCase()) {
            res.status(401).send('Invalid token');
            return;
        }
        // update user email
        await userContract.updateEmail(req.body.email, {from: decoded.address});
        // update user in database
        await UserDB.updateOne({address: address}, {email: req.body.email});
        // return success
        res.status(200).send('Success');
    });
});

module.exports = router;
