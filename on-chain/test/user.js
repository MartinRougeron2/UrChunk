const User = artifacts.require('../../contracts/User.sol');
const Post = artifacts.require('../../contracts/Post.sol');

contract('User', function (accounts) {

    it('initiates contract', async function () {
        let contract = await User.new("martin-test-init", "@", 1, {from: accounts[0]}); // function tested
        const name = await contract.name({from: accounts[1]});

        assert.equal(name, "martin-test-init", "name is not martin-test-init");
    });

    it('updateName', async function () {
        let contract = await User.new("martin-test-change-name", "@", 1, {from: accounts[0]});

        await contract.updateName("new-name", {from: accounts[0]}); // function tested
        const name = await contract.name({from: accounts[1]});

        assert.equal(name, "new-name", "name is not new-name");
    });

    it('updateEmail', async function () {
        let contract = await User.new("martin-test-change-email", "@", 1, {from: accounts[0]});

        await contract.updateEmail("@@", {from: accounts[0]}); // function tested
        const email = await contract.getEmail({from: accounts[0]});

        assert.equal(email, "@@", "email is not @@");
    });

    it('transferOwnership', async function () {
        let contract = await User.new("martin-test-transfer", "@", 1, {from: accounts[0]});

        await contract.transferOwnership(accounts[1], {from: accounts[0]}); // function tested
        const owner = await contract.owner({from: accounts[1]});

        assert.equal(owner, accounts[1], "owner is not accounts[1]");
    });

    it('buyUser', async function () {
        let contract = await User.new("martin-test-buy", "@", 1, {from: accounts[0]});

        await contract.buyUser({from: accounts[1], value: 1}); // function tested
        const owner = await contract.owner({from: accounts[1]});

        assert.equal(owner, accounts[1], "owner is not accounts[1]");
    });

    it('createPost', async function () {
        let contract = await User.new("martin-test", "@", 1, {from: accounts[0]});

        await contract.createPost("create-post-name", "create-post-content", 1); // function tested
        const contract_post_address = await contract.posts(0);

        assert(contract_post_address, "contract_post_address is not defined");
    });

    it('buyPost', async function () {
        let new_owner_contract = await User.new("martin-test", "@", 1, {from: accounts[1]});
        let base_owner_contract = await User.new("martin-test", "@", 1, {from: accounts[0]});
        let contract_post = await Post.new("post-owner-to-buy", "post-content", 1, base_owner_contract.address, {from: accounts[0]});

        // check if initial owner is base_owner_contract
        let contract_post_owner = await contract_post.owner({from: accounts[1]});
        let post_length = await new_owner_contract.getPostsLength({from: accounts[1]});

        assert.equal(contract_post_owner, base_owner_contract.address, "owner is not accounts[0]");
        // check if new_owner_contract has no posts
        assert.equal(post_length, 0, "post_length is not 0");

        // buy post
        await new_owner_contract.buyPost(contract_post.address, {from: accounts[1], value: 1}); // function tested
        contract_post_owner = await contract_post.owner({from: accounts[1]});
        post_length = await new_owner_contract.getPostsLength({from: accounts[1]});

        assert.equal(contract_post_owner, new_owner_contract.address, "owner is not accounts[1]");
        // check if new_owner_contract has 1 post
        assert.equal(post_length, 1, "post_length is not 1");
        post_length = await base_owner_contract.getPostsLength({from: accounts[0]});
        // check if base_owner_contract has 0 posts
        assert.equal(post_length, 0, "post_length is not 0");

    });

    it('isPostOwner', async function () {
        let contract = await User.new("martin-test", "@", 1, {from: accounts[0]});
        let contract_post = await Post.new("post-owner", "post-content", 1, contract.address, {from: accounts[0]});

        const isPostOwner = await contract.isPostOwner(contract_post.address); // function tested

        assert(isPostOwner, "isPostOwner is not true");
    });

    it('follow', async function () {
        let contract = await User.new("martin-test", "@", 1, {from: accounts[0]});
        let contract_2 = await User.new("martin-test-2", "@", 1, {from: accounts[1]});

        await contract.follow(contract_2.address); // function tested

        const isFollowing = await contract.following(contract_2.address);
        const followingCount = await contract.getFollowingCount();

        assert(isFollowing, "following is not true");
        assert(followingCount > 0, "followingCount is not > 0");
    });
});
