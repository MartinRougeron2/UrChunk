const express = require('express');
const {User, Post} = require('../web3');
const {UserDB, PostDB} = require('../database');
const {jwt_verify} = require("../common");


const router = express.Router();

async function transferUserOwnership(req, res, decoded) {
    // get user address from req
    const address = req.cookies.user;
    // get user contract
    const userContract = await User.at(address);
    // check if user is the same as the one in the token
    const userAddress = await userContract.owner();
    if (userAddress.toString().toLowerCase() !== decoded.address.toString().toLowerCase()) {
        res.status(401).send('Invalid token');
        return;
    }
    // transfer user ownership
    await userContract.transferOwnership(req.body.newOwner, {from: decoded.address});
    // update user in database
    await UserDB.updateOne({address: address}, {owner: req.body.newOwner});
    // return success
    res.status(200).send('Success');
}

// transfer user ownership OK
router.post('/transfer-user-ownership', async (req, res) => {
    jwt_verify(req, res, transferUserOwnership);
});

module.exports = router;
