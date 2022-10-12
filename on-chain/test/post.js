const Post = artifacts.require('../../contracts/Post.sol');

contract('Post', function (accounts) {

    it('initiates contract', async function () {
        const contract = await Post.new("martin-test-post", "@", 1);

        const name = await contract.title.call();
        const content = await contract.content.call();
        const owner = await contract.owner.call();
        const price = await contract.price.call();

        assert.equal(name, "martin-test-post", "title is not martin-test");
        assert.equal(content, "@", "content is not @");
        assert.equal(owner, accounts[0], "owner is not accounts[0]");
        assert.equal(price, 1, "price is not 1");
    });
    it('buy', async function () {
        const contract = await Post.new("martin-test", "@", 1);
        await contract.buy.call({ from: accounts[1], value: 1});

    }); // Done by User tests
    it('like', async function () {
        const contract = await Post.deployed();

        await contract.like.call({from: accounts[1]});

        const isLiked = await contract.likes.call(accounts[1]);
        const likesCount = await contract.likesCount.call();

        assert(isLiked, "isLiked is not true");
        assert.equal(likesCount, 1, "likes[0] is not accounts[1]");
    });
    it('changePrice', async function () {
        const contract = await Post.new("martin-test-post", "@", 1, {from: accounts[0]});

        const price = await contract.price.call();
        assert.equal(price, 1, "price is not 1");

        await contract.changePrice.call(2, {from: accounts[0]});

        let newPrice = await contract.price.call();
        newPrice = newPrice.toString();
        assert.equal(newPrice, 2, "price is not 2");
    });
});
