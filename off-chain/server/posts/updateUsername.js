const express = require('express');
const {User, Post} = require('../web3');
const {UserDB, PostDB} = require('../database');
const {jwt_verify} = require("../common");


const router = express.Router();

async function updateUsername(req, res, decoded) {
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
    // update user name
    await userContract.updateName(req.body.name, {from: decoded.address});
    // update user in database
    await UserDB.updateOne({address: address}, {name: req.body.name});
    // return success
    res.status(200).send('Success');
}

// update user name OK
router.post('/update-username', async (req, res) => {
    jwt_verify(req, res, updateUsername);
});

module.exports = router;
