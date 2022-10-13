const User = artifacts.require('../../contracts/User.sol');
const Post = artifacts.require('../../contracts/Post.sol');

contract('User', function (accounts) {

    it('initiates contract', async function () {
        let contract = await User.new("martin-test", "@", 1, {from: accounts[0]});
        const name = await contract.name({from: accounts[1]});

        assert.equal(name, "martin-test", "name is not martin-test");
    });

    it('updateName', async function () {
        let contract = await User.new("martin-test", "@", 1, {from: accounts[0]});

        await contract.updateName("new-name", {from: accounts[0]});
        const name = await contract.name({from: accounts[1]});

        assert.equal(name, "new-name", "name is not new-name");
    });

    it('updateEmail', async function () {
        let contract = await User.new("martin-test", "@", 1, {from: accounts[0]});

        await contract.updateEmail("@@", {from: accounts[0]});
        const email = await contract.getEmail({from: accounts[0]});

        assert.equal(email, "@@", "email is not @@");
    });

    it('transferOwnership', async function () {
        let contract = await User.new("martin-test", "@", 1, {from: accounts[0]});

        await contract.transferOwnership(accounts[1], {from: accounts[0]});
        const owner = await contract.owner({from: accounts[1]});

        assert.equal(owner, accounts[1], "owner is not accounts[1]");
    });

    it('buyUser', async function () {
        let contract = await User.new("martin-test-buy", "@", 1, {from: accounts[0]});

        await contract.buyUser({from: accounts[1], value: 1});
        const owner = await contract.owner({from: accounts[1]});

        assert.equal(owner, accounts[1], "owner is not accounts[1]");
    });

    it('createPost', async function () {
        let contract = await User.new("martin-test", "@", 1, {from: accounts[0]});

        await contract.createPost("post-name", "post-content", 1);
        const contract_post_address = await contract.posts(0);

        assert(contract_post_address, "contract_address is not contract_post_address");
    });

    it('buyPost', async function () {
        let contract = await User.new("martin-test", "@", 1, {from: accounts[1]});
        let o_contract = await User.new("martin-test", "@", 1, {from: accounts[0]});
        let contract_post = await Post.new("post-owner-to-buy", "post-content", 1, o_contract.address, {from: accounts[0]});

        let contract_post_owner = await contract_post.owner({from: accounts[1]});
        let post_length = await contract.getPostsLength({from: accounts[1]});
        assert.equal(contract_post_owner, o_contract.address, "owner is not accounts[0]");
        assert.equal(post_length, 0, "post_length is not 0");

        await contract.buyPost(contract_post.address, {from: accounts[1], value: 1});
        contract_post_owner = await contract_post.owner({from: accounts[1]});
        post_length = await contract.getPostsLength({from: accounts[1]});

        assert.equal(contract_post_owner, contract.address, "owner is not accounts[1]");
        assert.equal(post_length, 1, "post_length is not 1");

    });

    it('isPostOwner', async function () {
        let contract = await User.new("martin-test", "@", 1, {from: accounts[0]});
        let contract_post = await Post.new("post-owner", "post-content", 1, contract.address, {from: accounts[0]});

        const isPostOwner = await contract.isPostOwner(contract_post.address);

        assert(isPostOwner, "isPostOwner is not true");
    });

    it('follow', async function () {
        let contract = await User.new("martin-test", "@", 1, {from: accounts[0]});
        let contract_2 = await User.new("martin-test-2", "@", 1, {from: accounts[1]});

        await contract.follow(contract_2.address);

        const isFollowing = await contract.following(contract_2.address);
        const followingCount = await contract.getFollowingCount();

        assert(isFollowing, "following is not true");
        assert(followingCount > 0, "followingCount is not > 0");
    });
});
