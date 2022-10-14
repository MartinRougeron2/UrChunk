// init express app
const express = require('express');
const app = express();

// init web3
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

// init contract
const contract = require('truffle-contract');
const user_artifact = require('../postandbuy-dapp/src/contracts/User.json');
const User = contract(user_artifact);
User.setProvider(web3.currentProvider);
const post_artifact = require('../postandbuy-dapp/src/contracts/Post.json');
const Post = contract(post_artifact);
Post.setProvider(web3.currentProvider);

// set DB connection
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/postandbuy', {useNewUrlParser: true});
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
const UserDB = mongoose.model('User', userSchema);
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
const PostDB = mongoose.model('Post', postSchema);


// log user using web3 and return jwt token and document with swagger

app.post('/login', async (req, res) => {
    // check signature
    const signature = req.body.signature;
    const address = req.body.address;
    const message = req.body.message;
    const recovered = web3.eth.accounts.recover(message, signature);
    if (recovered !== address) {
        res.status(401).send('Invalid signature');
        return;
    }
    // return jwt token
    const token = jwt.sign({address: address}, 'secret', {expiresIn: '1h'});
    res.status(200).send({token: token});
});

// add post to database
app.post('/addPost', async (req, res) => {
    // check jwt token
    const token = req.body.token;
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
        const userAddress = await userContract.getOwner();
        if (userAddress !== decoded.address) {
            res.status(401).send('Invalid token');
            return;
        }
        // create post
        const tx = await userContract.createPost(req.body.name, req.body.content, req.body.price, userAddress, {from: decoded.address});
        const postAddress = tx.logs[0].address;
        // add post to database
        const post = new PostDB({
            address: postAddress,
            name: req.body.name,
            content: req.body.content,
            price: req.body.price,
            author: userAddress,
        });
        await post.save();
        // return post address
        res.status(200).send({postAddress: postAddress});
    });
});

// create user
app.post('/createUser', async (req, res) => {
    // check jwt token
    const token = req.body.token;
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
        const tx = await User.new(req.body.name, req.body.content, req.body.price, {from: decoded.address});
        const userAddress = tx.logs[0].address;
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

// buy post
app.post('/buyPost', async (req, res) => {
    // check jwt token
    const token = req.body.token;
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
        const userAddress = req.body.userAddress;
        // get post contract
        const postContract = await Post.at(postAddress);
        // get post owner
        const postOwner = await postContract.getOwner();
        // get user contract
        const userContract = await User.at(userAddress);
        // get user owner
        const userOwner = await userContract.getOwner();
        // check if user is the same as the one in the token
        if (userOwner !== decoded.address) {
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
app.post('/updateUserName', async (req, res) => {
    // check jwt token
    const token = req.body.token;
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
        const userAddress = await userContract.getOwner();
        if (userAddress !== decoded.address) {
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
app.post('/updateUserEmail', async (req, res) => {
    // check jwt token
    const token = req.body.token;
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
        const userAddress = await userContract.getOwner();
        if (userAddress !== decoded.address) {
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
app.post('/transferUserOwnership', async (req, res) => {
    // check jwt token
    const token = req.body.token;
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
        const userAddress = await userContract.getOwner();
        if (userAddress !== decoded.address) {
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
app.post('/buyUser', async (req, res) => {
    // check jwt token
    const token = req.body.token;
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
        const userAddress = req.body.userAddress;
        // get user contract
        const userContract = await User.at(userAddress);
        // get user owner
        const userOwner = await userContract.getOwner();
        // check if user is the same as the one in the token
        if (userOwner !== decoded.address) {
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
app.post('/followUser', async (req, res) => {
    // check jwt token
    const token = req.body.token;
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
        const userAddress = req.body.userAddress;
        // get user contract
        const userContract = await User.at(userAddress);
        // get user owner
        const userOwner = await userContract.getOwner();
        // check if user is the same as the one in the token
        if (userOwner !== decoded.address) {
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
app.post('/likePost', async (req, res) => {
    // check jwt token
    const token = req.body.token;
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
        const postOwner = await postContract.getOwner();
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
app.post('/postChangePrice', async (req, res) => {
    // check jwt token
    const token = req.body.token;
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
        const postOwner = await postContract.getOwner();
        // check if user is the same as the one in the token
        if (postOwner !== decoded.address) {
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
const port = process.env.PORT || 3000;

// launch server
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});