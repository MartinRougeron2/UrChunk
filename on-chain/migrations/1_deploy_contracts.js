var User = artifacts.require("User");
var Post = artifacts.require("Post");

module.exports = function(deployer) {
  deployer.deploy(User, "martin-ganache", "@", 1);
  deployer.deploy(Post, "martin-ganache-post", "martin-ganache-content", 1, User.address);
}
