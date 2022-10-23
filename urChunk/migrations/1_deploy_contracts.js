var Chunker = artifacts.require("Chunker");
var Chunk = artifacts.require("Chunk");

module.exports = function (deployer) {
    deployer.deploy(Chunker, "martin-ganache");
    deployer.deploy(Chunk, "martin-ganache-post");
}
