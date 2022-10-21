// log user using web3 and return jwt token OK
const jwt = require("jsonwebtoken");
const express = require('express');
const {User, Post} = require('../web3');
const {UserDB, PostDB} = require('../database');
const {web3} = require('../web3');

const router = express.Router();
router.post('/login', async (req, res) => {
    console.log(req.cookies.token);

    const {signature, message} = req.body;

    const address = req.body.address.toString().toLowerCase();
    const recovered = web3.eth.accounts.recover(message, signature).toString().toLowerCase();

    console.log('address', address);
    console.log('recovered', recovered);

    // check signature
    if (recovered !== address) {
        console.log('signature not match');
        res.status(401).send('Invalid signature');
        return;
    }
    // return jwt token
    jwt.sign({address: address}, 'secret', {expiresIn: '1h'}, (err, token) => {
        if (err) {
            console.log('jwt error', err);
            res.status(500).send('Error generating token');
            return;
        }
        console.log('setting headers');

        res.cookie('token', token, {
            expires: new Date(Date.now() + 3_600_000),
            httpOnly: true,
            secure: true,
            sameSite: "none",
        }).status(200).send('Login success');
    });
});

module.exports = router;