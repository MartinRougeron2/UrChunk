const mongoose = require("./init");
const {UserDB, PostDB} = require("./schemas");

module.exports = {mongoose, UserDB, PostDB};