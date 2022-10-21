// init web3
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

// init contract
const contract = require('truffle-contract');

const user_artifact = require('../../postandbuy-dapp/src/contracts/User.json');
const post_artifact = require('../../postandbuy-dapp/src/contracts/Post.json');

const User = contract(user_artifact);
const Post = contract(post_artifact);

User.setProvider(web3.currentProvider);
Post.setProvider(web3.currentProvider);

module.exports = {web3, User, Post};