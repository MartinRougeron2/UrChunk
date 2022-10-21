const mongoose = require('./init');
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

module.exports = {UserDB, PostDB};
