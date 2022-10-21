const login = require('./login');
const createUser = require('./createUser');
const createPost = require('./createPost');
const buyPost = require('./buyPost');
const updateUsername = require('./updateUsername');
const updateEmail = require('./updateEmail');
const transferUserOwnership = require('./transferUserOwnership');
const buyUser = require('./buyUser');
const followUser = require('./followUser');
const likePost = require('./likePost');
const postChangePrice = require('./postChangePrice');

module.exports = {
    login,
    createUser,
    createPost,
    buyPost,
    updateUsername,
    updateEmail,
    transferUserOwnership,
    buyUser,
    followUser,
    likePost,
    postChangePrice
};
