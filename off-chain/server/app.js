// init express app
const express = require('express');
// cookie parser
const cookieParser = require("cookie-parser");
// CORS
const cors = require('cors');

// import posts
const {
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
} = require('./posts');

// import gets
const {getAuth} = require('./gets');

// import config
const {corsOptions, port} = require('./config');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

// posts
app.use(login);
app.use(createUser);
app.use(createPost);
app.use(buyPost);
app.use(updateUsername);
app.use(updateEmail);
app.use(transferUserOwnership);
app.use(buyUser);
app.use(followUser);
app.use(likePost);
app.use(postChangePrice);

// gets
app.use(getAuth);

// launch server
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});