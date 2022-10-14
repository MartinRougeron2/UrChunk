// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.8.17;

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
        // update name
        name = _name;
        // emit event of name update
        emit NameUpdated(name);
    }

    // update user email
    function updateEmail(string memory _email) public override {
        require(msg.sender == owner, "You must be the owner of this user to update the email");
        // update email
        email = _email;
        // emit event of email update
        emit EmailUpdated(email);
    }

    // get email
    function getEmail() public view override returns (string memory) {
        // return email if the user is the owner of the account
        require(msg.sender == owner, "You must be the owner of this user to show the email");
        return email;
    }

    // transfer ownership of the user
    function transferOwnership(address _newOwner) public override {
        // check if _newOwner is address(0)
        require(_newOwner != address(0), "New owner cannot be address(0)");
        require(msg.sender == owner, "You must be the owner of this user to transfer ownership");
        address oldOwner = owner;
        // transfer ownership
        owner = payable(_newOwner);
        // emit event of ownership change
        emit OwnershipTransferred(oldOwner, owner);
    }

    // buy a user
    function buyUser() public payable override {
        require(msg.value == uint64(price), "You must pay the price to buy this user");

        address oldOwner = owner;
        // transfer ownership
        owner = payable(msg.sender);
        // transfer money
        payable(oldOwner).transfer(msg.value);
        // emit event of ownership change
        emit OwnershipTransferred(oldOwner, owner);
    }


    // create a new post
    function createPost(string memory _title, string memory _content, uint64 _price) public override returns (address) {
        require(msg.sender == owner, "You must be the owner of this user to create a post");
        Post post = new Post(_title, _content, _price, address(this));
        // emit event of post creation
        emit PostCreatedFromUser(address(post));
        return address(post);
    }


    // buy a post
    function buyPost(address _post) public payable override {
        Post post = Post(_post);
        // buy the post
        post.buy{value: msg.value}(address(this));
        // emit event of post creation
        emit PostBuyFromUser(_post);
    }

    // detect if a post is owned by the user
    function isPostOwner(address _post) public view override returns (bool) {
        Post post = Post(_post);
        return post.getOwner() == address(this);
    }

    // user follow another user
    function follow(address _user) public override {
        require(msg.sender == owner, "You must be the owner of this user to follow another user");
        // add to following
        following[_user] = true;
        followingCount++;
        // emit event of follow
        emit Followed(_user);
    }

    // get user followers count
    function getFollowingCount() public view override returns (uint256) {
        return followingCount;
    }

}
