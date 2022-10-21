// set DB connection
const mongoose = require('mongoose');
// get environment variables
const dotenv = require('dotenv');
dotenv.config({path: '.env'});
const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;
const uri = `mongodb+srv://${username}:${password}@postandbuycluster.snuasop.mongodb.net/?retryWrites=true&w=majority`;

mongoose.connect(uri, {useNewUrlParser: true});

module.exports = mongoose;