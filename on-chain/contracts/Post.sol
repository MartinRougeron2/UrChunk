// SPDX-License-Identifier: UNLICENSED

pragma solidity >=0.7.0 <0.9.0;

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
    int64 public price;
    mapping(address => bool) public likes;
    uint256 public likesCount;

    constructor(string memory _title, string memory _content, int64 _price, address _author) {
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
        require(msg.value == uint64(price), "You must pay the price to buy this post");
        address oldOwner = owner;
        owner = _user;
        User(oldOwner).owner().transfer(msg.value);
        // emit event of ownership change
        emit OwnershipChanged(oldOwner, owner);
        // detect if the post was sold
        User user = User(oldOwner);
        // if the post was sold, the user's posts will be updated
        user.removePost(address(this));
    }

    // like the post
    function like(address _user) public override {
        User user = User(_user);
        require(user.owner() == msg.sender, "You must be the owner of the user to like this post");
        require(likes[_user] == false, "You already liked this post");
        likes[_user] = true;
        likesCount++;
        emit Liked(_user);
    }

    // change price of the post
    function changePrice(int64 _price, address _user_sender) public override {
        User user = User(owner);
        User sender = User(_user_sender);
        require(address(sender.owner()) == msg.sender, "You must be the owner of this user to change the price");
        require(address(user.owner()) == address(sender.owner()), "You must be the owner of this post to change the price");
        price = _price;
        // emit event of price change
        emit PriceChanged(price);
    }

    // get owner
    function getOwner() public view override returns (address) {
        return owner;
    }
}
