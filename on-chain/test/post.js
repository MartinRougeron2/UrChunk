const Post = artifacts.require('../../contracts/Post.sol');
const User = artifacts.require('../../contracts/User.sol');

contract('Post', function (accounts) {

    it('initiates contract', async function () {
        const contract_user = await User.deployed();
        const contract = await Post.new("martin-test-post", "@", 1, contract_user.address);

        const name = await contract.title({from: accounts[0]});
        const content = await contract.content({from: accounts[0]});
        const owner = await contract.owner({from: accounts[0]});
        const price = await contract.price({from: accounts[0]});

        assert.equal(name, "martin-test-post", "title is not martin-test");
        assert.equal(content, "@", "content is not @");
        assert.equal(owner, contract_user.address, "owner is not accounts[0]");
        assert.equal(price, 1, "price is not 1");
    });
    it('buy', async function () {
        const contract_user_owner = await User.deployed();
        const contract_user_new = await User.new("martin-test", "@", 1, {from: accounts[0]});

        const contract = await Post.new("martin-test", "@", 1, contract_user_owner.address);
        assert.equal(contract_user_owner.address, await contract.owner({from: accounts[0]}), "owner is not old owner");

        await contract.buy(contract_user_new.address, {from: accounts[1], value: 1});

        assert.equal(contract_user_new.address, await contract.owner({from: accounts[1]}), "owner is not new owner");

    }); // Done by User tests
    it('like', async function () {
        const contract_user_owner = await User.new("martin-test", "@", 1, {from: accounts[0]});
        const contract = await Post.deployed();

        await contract.like(contract_user_owner.address, {from: accounts[0]});

        const isLiked = await contract.likes(contract_user_owner.address, {from: accounts[1]});
        assert(isLiked, "isLiked is not true");
    });
    it('changePrice', async function () {
        const contract_user = await User.new("martin-test", "@", 1, {from: accounts[0]});
        const contract = await Post.new("martin-test-post", "@", 1, contract_user.address, {from: accounts[0]});

        const price = await contract.price({from: accounts[0]});
        assert.equal(price, 1, "price is not 1");

        await contract.changePrice(2, contract_user.address, {from: accounts[0]});

        let newPrice = await contract.price({from: accounts[0]});
        newPrice = newPrice.toString();
        assert.equal(newPrice, 2, "price is not 2");
    });
});
