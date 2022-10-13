// SPDX-License-Identifier: UNLICENSED

pragma solidity >=0.7.0 <0.9.0;

import "./IUser.sol";
import "./Post.sol";
import "./IPost.sol";

contract User is IUser {
    // user's name
    string public name;
    // user's address
    string private email;
    // user's address
    address payable public owner;
    // user's posts
    address[] public posts;
    // user's followers
    mapping(address => bool) public following;
    // user's followers count
    uint256 followingCount;
    // price of the user
    int64 public price;

    constructor(string memory _name, string memory _email, int64 _price) {
        name = _name;
        email = _email;
        owner = payable(msg.sender);
        price = _price;
        followingCount = 0;
        emit UserCreated(address(this));
    }

    // update user name
    function updateName(string memory _name) public override {
        require(msg.sender == owner, "You must be the owner of this user to update the name");
        name = _name;
        emit NameUpdated(name);
    }

    // update user email
    function updateEmail(string memory _email) public override {
        require(msg.sender == owner, "You must be the owner of this user to update the email");
        email = _email;
        emit EmailUpdated(email);
    }

    // get email
    function getEmail() public view override returns (string memory) {
        require(msg.sender == owner, "You must be the owner of this user to show the email");
        return email;
    }

    // transfer ownership of the user
    function transferOwnership(address _newOwner) public override {
        require(msg.sender == owner, "You must be the owner of this user to transfer ownership");
        address oldOwner = owner;
        owner = payable(_newOwner);
        emit OwnershipTransferred(oldOwner, owner);
    }

    // buy a user
    function buyUser() public payable override {
        require(msg.value == uint64(price), "You must pay the price to buy this user");
        address oldOwner = owner;
        owner = payable(msg.sender);
        payable(oldOwner).transfer(msg.value);
        // emit event of ownership change
        emit OwnershipTransferred(oldOwner, owner);
    }


    // create a new post
    function createPost(string memory _title, string memory _content, int64 _price) public override returns (address) {
        require(msg.sender == owner, "You must be the owner of this user to create a post");
        Post post = new Post(_title, _content, _price, address(this));
        posts.push(address(post));
        emit PostCreated(address(post));
        return address(post);
    }

    // get posts length
    function getPostsLength() public view override returns (uint256) {
        return posts.length;
    }

    // buy a post
    function buyPost(address _post) public payable override {
        Post post = Post(_post);
        // buy the post
        post.buy{value: msg.value}(address(this));
        posts.push(_post);
        emit PostSold(_post);
    }

    // detect if a post is owned by the user
    function isPostOwner(address _post) public view override returns (bool) {
        Post post = Post(_post);
        return post.getOwner() == address(this);
    }

    // user follow another user
    function follow(address _user) public override {
        require(msg.sender == owner, "You must be the owner of this user to follow another user");
        following[_user] = true;
        followingCount++;
        emit Followed(_user);
    }

    // get user followers count
    function getFollowingCount() public view override returns (uint256) {
        return followingCount;
    }

    // remove a post from the user if not owned by the user
    function removePost(address _post) public override {
        for (uint i = 0; i < posts.length; i++) {
            if (posts[i] == _post) {
                if (!isPostOwner(_post)) {
                    posts[i] = posts[posts.length - 1];
                    posts.pop();
                    emit PostSold(_post);
                }
            }
        }
    }

    // event of user creation
    event UserCreated(address user);
    // event of name update
    event NameUpdated(string name);
    // event of email update
    event EmailUpdated(string email);
    // event of post creation
    event PostCreated(address post);
    // event of post sold
    event PostSold(address post);
    // event of following another user
    event Followed(address user);
    // event of ownership transfer
    event OwnershipTransferred(address oldOwner, address newOwner);
    // event of user bought
    event UserBought(address user);
}
