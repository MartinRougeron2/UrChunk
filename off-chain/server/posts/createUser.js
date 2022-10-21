const jwt = require("jsonwebtoken");
const express = require('express');
const {User, Post} = require('../web3');
const {UserDB, PostDB} = require('../database');


const router = express.Router();

// create user OK
router.post('/create-user', async (req, res) => {
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
        // create user
        const tx = await User.new(req.body.name, req.body.email, req.body.price, {from: decoded.address});
        console.log(tx.address);
        const userAddress = tx.address;
        // add user to database
        const user = new UserDB({
            address: userAddress,
            name: req.body.name,
            content: req.body.content,
            price: req.body.price,
            owner: decoded.address,
        });
        await user.save();
        // return user address
        res.status(200).send({userAddress: userAddress});
    });
});

module.exports = router;