// SPDX-License-Identifier: UNLICENSED

pragma solidity >=0.7.0 <0.9.0;

import "./User.sol";
import "./IPost.sol";

contract Post is IPost {
    string public title;
    string public content;
    address public author;
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
        emit PostCreated(address(this));
    }

    // change ownership of the post by paying the price !
    function buy(address _user) public payable override {
        require(msg.value == uint64(price), "You must pay the price to buy this post");
        address oldOwner = owner;
        owner = _user;
        User(oldOwner).owner().transfer(msg.value);
        // emit event of ownership change
        emit OwnershipChanged(oldOwner, owner);
        // detect if the post was sold
//        User user = User(oldOwner);
//        // if the post was sold, the user's posts will be updated
//        user.removePost(address(this));
    }

    // like the post !
    function like() public override {
        require(likes[msg.sender] == false, "You already liked this post");
        likes[msg.sender] = true;
        likesCount++;
        emit Liked(msg.sender);
    }

    // change price of the post !
    function changePrice(int64 _price) public override {
        require(msg.sender == owner, "You must be the owner of this post to change the price");
        price = _price;
        // emit event of price change
        emit PriceChanged(price);
    }

    // get owner !
    function getOwner() public view override returns (address) {
        return owner;
    }


    // event of Post creation
    event PostCreated(address post);
    // event of like
    event Liked(address user);
    // event of ownership change
    event OwnershipChanged(address oldOwner, address newOwner);
    // event of price change
    event PriceChanged(int64 price);
}
