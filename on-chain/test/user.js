const User = artifacts.require('../../contracts/User.sol');
const Post = artifacts.require('../../contracts/Post.sol');

let UserAddress = "";

contract('User', function (accounts) {

    it('initiates contract', async function () {
        const contract = await User.new("martin-test", "@", 1, {from: accounts[0]});
        UserAddress = contract.address;
        const name = await contract.name.call({from: accounts[1]});

        assert.equal(name, "martin-test", "name is not martin-test");
    });

    it('updateName', async function () {
        const contract = await User.new("martin-test", "@", 1, {from: accounts[0]});

        await contract.updateName.call("new-name", {from: accounts[0]});
        const name = await contract.name.call({from: accounts[1]});

        assert.equal(name, "new-name", "name is not new-name");
    });

    it('updateEmail', async function () {
        const contract = await User.new("martin-test", "@", 1, {from: accounts[0]});

        await contract.updateEmail.call("@@", {from: accounts[0]});
        const email = await contract.getEmail.call({from: accounts[0]});

        assert.equal(email, "@@", "email is not @@");
    });

    it('transferOwnership', async function () {
        const contract = await User.new("martin-test", "@", 1, {from: accounts[0]});

        await contract.transferOwnership.call(accounts[1], {from: accounts[0]});
        const owner = await contract.owner.call({from: accounts[1]});

        assert.equal(owner, accounts[1], "owner is not accounts[1]");
    });

    it('buyUser', async function () {
        const contract = await User.new("martin-test-buy", "@", 1, {from: accounts[0]});

        await contract.buyUser.call({from: accounts[1], value: 1});
        const owner = await contract.owner.call({from: accounts[1]});

        assert.equal(owner, accounts[1], "owner is not accounts[1]");
    });

    it('createPost', async function () {
        const contract = await User.new("martin-test", "@", 1, {from: accounts[0]});

        await contract.createPost.call("post-name", "post-content", 1);
        const post = await contract.posts.call[0];

        assert.equal(post.name, "post-name", "post.name is not post-name");
        assert.equal(post.content, "post-content", "post.content is not post-content");
        assert.equal(post.price, 1, "post.price is not 1");
    });
    //
    // it('buyPost', async function () {
    //     const contract = await User.new("martin-test", "@", 1, {from: accounts[0]});
    //     const contract_post = await Post.deployed();
    //
    //     await contract.buyPost.call(contract_post.address);
    //     const post = await contract.posts.call[0];
    //
    //     assert.equal(post.name, "post-name", "post.name is not post-name");
    // });
    //
    // it('isPostOwner', async function () {
    //     const contract = await User.new("martin-test", "@", 1, {from: accounts[0]});
    //     const contract_post = await Post.new("post-owner", "post-content", 1);
    //
    //     const isPostOwner = await contract.isPostOwner.call(contract_post.address);
    //
    //     assert(isPostOwner, "isPostOwner is not true");
    // });
    //
    // it('follow', async function () {
    //     const contract = await User.new("martin-test", "@", 1, {from: accounts[0]});
    //     const contract_2 = await User.new("martin-test-2", "@", 1);
    //
    //     await contract.follow.call(contract_2.address);
    //
    //     const isFollowing = await contract.following.call(contract_2.address);
    //     const followingCount = await contract.followingCount.call();
    //
    //     assert(isFollowing, "following is not true");
    //     assert(followingCount > 0, "followingCount is not > 0");
    // });
    //
    // it('detectSoldPosts', async function () {
    //     const contract = await User.new("martin-test", "@", 1, {from: accounts[0]});
    //     const contract_2 = await User.new("martin-test-2", "@", 1);
    //     const contract_post = await Post.deployed();
    //
    //     await contract_2.buyPost.call(contract_post.address);
    //     // await contract.detectSoldPosts.call();
    //
    //     const post = await contract.posts.call()[0];
    //     assert(post === undefined, "soldPosts is not == 0");
    // });
    //
    // it('removePost', async function () {
    //     const contract = await User.new("martin-test", "@", 1, {from: accounts[0]});
    //     const contract_post = await Post.deployed();
    //
    //     await contract.removePost.call(contract_post.address);
    //
    //     const post = await contract.posts.call()[0];
    //     assert(post === undefined, "posts is not == 0");
    // });
});
