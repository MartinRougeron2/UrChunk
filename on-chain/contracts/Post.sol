// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.8.17;

import "./User.sol";
import "./IPost.sol";

contract Post is IPost {
    string public title;
    string public content;
    // User address ! NOT ACCOUNT
    address public author;
    // User address ! NOT ACCOUNT
    address public owner;
    uint public createdAt;
    uint64 public price;
    mapping(address => bool) public likes;
    uint256 public likesCount;

    constructor(string memory _title, string memory _content, uint64 _price, address _author) {
        // check if the author is a valid user
        require(_author != address(0), "Author must be a valid user");

        title = _title;
        content = _content;
        author = _author;
        owner = _author;
        createdAt = uint(block.timestamp);
        price = _price;
        likesCount = 0;
        emit PostCreated(address(this));
    }

    // change ownership of the post by paying the price
    function buy(address _user) public payable override {
        // check if the user is a valid user
        require(_user != address(0), "User must be a valid user");
        require(msg.value == uint64(price), "You must pay the price to buy this post");
        address oldOwner = owner;
        require(oldOwner != address(0), "oldOwner must be a valid user");
        // transfer ownership
        owner = _user;
        // transfer money
        User(oldOwner).owner().transfer(msg.value);
        // emit event of ownership change
        emit OwnershipChanged(oldOwner, owner);
    }

    // like the post
    function like(address _user) public override {
        // check if the user is a valid user
        require(_user != address(0), "User must be a valid user");

        User user = User(_user);

        require(user.owner() == msg.sender, "You must be the owner of the user to like this post");
        require(!likes[_user], "You already liked this post");
        // add like
        likes[_user] = true;
        likesCount++;

        // emit event of like
        emit Liked(_user);
    }

    // change price of the post
    function changePrice(uint64 _price, address _userSender) public override {
        // check if the user is a valid user
        require(_userSender != address(0), "User must be a valid user");
        User user = User(owner);
        User sender = User(_userSender);

        require(address(sender.owner()) == msg.sender, "You must be the owner of this user to change the price");
        require(address(user.owner()) == address(sender.owner()), "You must be the owner of this post to change the price");
        // update price
        price = _price;

        // emit event of price change
        emit PriceChanged(price);
    }

    // get owner
    function getOwner() public view override returns (address) {
        return owner;
    }
}
