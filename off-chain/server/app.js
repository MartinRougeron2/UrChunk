// init express app
const express = require('express');
const app = express();
app.use(express.json());

// init web3
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

// init contract
const contract = require('truffle-contract');

const user_artifact = require('../postandbuy-dapp/src/contracts/User.json');
const post_artifact = require('../postandbuy-dapp/src/contracts/Post.json');

const User = contract(user_artifact);
const Post = contract(post_artifact);

User.setProvider(web3.currentProvider);
Post.setProvider(web3.currentProvider);

// set DB connection
const mongoose = require('mongoose');
// get environment variables
const dotenv = require('dotenv');
dotenv.config();
const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;
const uri = `mongodb+srv://${username}:${password}@postandbuycluster.snuasop.mongodb.net/?retryWrites=true&w=majority`;

mongoose.connect(uri, {useNewUrlParser: true});
// set DB schema
const Schema = mongoose.Schema;

const userSchema = new Schema({
    address: String,
    name: String,
    email: String,
    posts: Array,
    price: Number,
    owner: String,
    followers: Array,
});
const postSchema = new Schema({
    address: String,
    title: String,
    content: String,
    price: Number,
    owner: String,
    author: String,
    createdAt: Date,
    likes: Array,
});

const UserDB = mongoose.model('User', userSchema);
const PostDB = mongoose.model('Post', postSchema);

// jwt
const jwt = require('jsonwebtoken');

// cookie parser
const cookieParser = require("cookie-parser");

app.use(cookieParser());

// check jwt token OK
app.get('/check-auth', (req, res) => {
    const token = req.cookies.token;
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Credentials', true);
    if (!token) {
        res.status(401).json({message: "Unauthorized"});
    } else {
        jwt.verify(token, 'secret', (err, decoded) => {
            if (err) {
                res.status(401).json({message: "Unauthorized"});
            } else {
                res.status(200).json({message: "Authorized"});
            }
        });
    }
});

// log user using web3 and return jwt token OK
app.post('/login', async (req, res) => {
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
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
        res.setHeader('Access-Control-Allow-Credentials', true);
        res.cookie('token', token, {
            expires: new Date(Date.now() + 3_600_000),
            httpOnly: true,
            secure: true,
            sameSite: "none",
        }).status(200).send('Login success');
    });
});

// create user OK
app.post('/create-user', async (req, res) => {
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
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
        res.setHeader('Access-Control-Allow-Credentials', true);
        // return user address
        res.status(200).send({userAddress: userAddress});
    });
});

// create post OK
app.post('/create-post', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Credentials', true);
    console.log(req.cookies);
    // check jwt token
    const token = req.cookies.token;
    if (!token) {
        res.status(401).send('No token provided');
        return;
    }
    jwt.verify(token, 'secret', async (err, decoded) => {
        if (err) {
            console.log(err);
            res.status(401).send('Invalid token');
            return;
        }
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
        console.log('post', post);
        // return post address
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
        res.setHeader('Access-Control-Allow-Credentials', true);
        res.status(200).send({postAddress: postAddress});
    });
});

// buy post OK
app.post('/buy-post', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Credentials', true);
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
        // get post address from req
        const postAddress = req.body.postAddress;
        // get user address from req
        const userAddress = req.cookies.user;
        // get post contract
        const postContract = await Post.at(postAddress);
        // get post owner
        const postOwner = await postContract.owner();
        // get user contract
        const userContract = await User.at(userAddress);
        // get user owner
        const userOwner = await userContract.owner();
        // check if user is the same as the one in the token
        if (userOwner.toString().toLowerCase() !== decoded.address.toString().toLowerCase()) {
            res.status(401).send('Invalid token');
            return;
        }
        // buy post
        await userContract.buyPost(postAddress, {from: decoded.address, value: req.body.price});
        // update post in database
        await PostDB.updateOne({address: postAddress}, {owner: decoded.address});
        // update old owner user in database
        await UserDB.updateOne({address: postOwner}, {$pull: {posts: postAddress}});
        // update new owner user in database
        await UserDB.updateOne({address: decoded.address}, {$push: {posts: postAddress}});
        // return success
        res.status(200).send('Success');
    });
});

// update user name
app.post('/update-username', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Credentials', true);
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
        // update user name
        await userContract.updateName(req.body.name, {from: decoded.address});
        // update user in database
        await UserDB.updateOne({address: address}, {name: req.body.name});
        // return success
        res.status(200).send('Success');
    });
});

// update user email
app.post('/update-email', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Credentials', true);
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
        if (userAddress.toString() !== decoded.address.toString().toLowerCase()) {
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

// transfer user ownership
app.post('/transfer-user-ownership', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Credentials', true);
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
        const address = req.body.address;
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
    });
});

// buy user
app.post('/buy-user', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Credentials', true);
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
        if (userOwner.toString().toLowerCase() !== decoded.address.toString().toLowerCase()) {
            res.status(401).send('Invalid token');
            return;
        }
        // buy user
        await userContract.buyUser({from: decoded.address, value: req.body.price});
        // update user in database
        await UserDB.updateOne({address: userAddress}, {owner: decoded.address});
        // return success
        res.status(200).send('Success');
    });
});

// follow user
app.post('/follow-user', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Credentials', true);
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
        if (userOwner.toString().toLowerCase() !== decoded.address.toString().toLowerCase()) {
            res.status(401).send('Invalid token');
            return;
        }
        // follow user
        await userContract.followUser({from: decoded.address});
        // update user in database
        await UserDB.updateOne({address: userAddress}, {$push: {followers: decoded.address}});
        // return success
        res.status(200).send('Success');
    });
});

// like post
app.post('/like-post', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Credentials', true);
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
        // get post address from req
        const postAddress = req.body.postAddress;
        // get post contract
        const postContract = await Post.at(postAddress);
        // get post owner
        const postOwner = await postContract.owner();
        // check if user is the same as the one in the token
        if (postOwner !== decoded.address) {
            res.status(401).send('Invalid token');
            return;
        }
        // like post
        await postContract.likePost({from: decoded.address});
        // update post in database
        await PostDB.updateOne({address: postAddress}, {$push: {likes: decoded.address}});
        // return success
        res.status(200).send('Success');
    });
});

// post change price
app.post('/post-change-price', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Credentials', true);
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
        // get post address from req
        const postAddress = req.body.postAddress;
        // get post contract
        const postContract = await Post.at(postAddress);
        // get post owner
        const postOwner = await postContract.owner();
        // check if user is the same as the one in the token
        if (postOwner.toString().toLowerCase() !== decoded.address.toString().toLowerCase()) {
            res.status(401).send('Invalid token');
            return;
        }
        // change post price
        await postContract.changePrice(req.body.price, {from: decoded.address});
        // update post in database
        await PostDB.updateOne({address: postAddress}, {price: req.body.price});
        // return success
        res.status(200).send('Success');
    });
});

// get port
const port = process.env.PORT || 8000;

// cors middleware to allow cross origin requests
const corsOptions = {
    origin: "http://localhost:3000",
    optionsSuccessStatus: 200,
    "Access-Control-Allow-Origin": "http://localhost:3000",
    "Access-Control-Allow-Methods": "GET, POST, DELETE",
    "Access-Control-Allow-Credentials": 'http://localhost:3000',
    "Access-Control-Max-Age": '600',
    "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept, Authorization",
    credentials: true

};
const cors = require('cors');
app.use(cors(corsOptions));

// start server

// launch server
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});