const express = require('express');
const {User, Post} = require('../web3');
const {UserDB, PostDB} = require('../database');
const {jwt_verify} = require('../common');


const router = express.Router();

async function buyUser(req, res, decoded) {
    // get user address from req
    const userAddress = req.cookies.user;
    // get user contract
    const userContract = await User.at(userAddress);
    // get user owner
    const userOwner = await userContract.owner();
    // check if user is the same as the one in the token
    if (userOwner.toString().toLowerCase() === decoded.address.toString().toLowerCase()) {
        res.status(401).send('Invalid user: user already owned');
        return;
    }
    const addressToBuy = req.body.addressToBuy;
    const userToBuyContract = await User.at(addressToBuy);
    // buy user
    await userToBuyContract.buyUser({from: decoded.address, value: req.body.price});
    // update user in database
    await UserDB.updateOne({address: userAddress}, {owner: decoded.address});
    // return success
    res.status(200).send('Success');
}

// buy user OK
router.post('/buy-user', async (req, res) => {
    jwt_verify(req, res, buyUser);
});

module.exports = router;
