// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.8.17;

interface IPost {
    struct Post {
        string title;
        string content;
        address author;
        address owner;
        int64 createdAt;
        int64 price;
        mapping(address => bool) likes;
        uint256 likesCount;
    }

    // event of Post creation
    event PostCreated(address post);
    // event of like
    event Liked(address user);
    // event of ownership change
    event OwnershipChanged(address oldOwner, address newOwner);
    // event of price change
    event PriceChanged(uint64 price);

    // change ownership of the post by paying the price
    function buy(address _user) external payable;

    // like the post
    function like(address _user) external;

    // change price of the post
    function changePrice(uint64 _price) external;

    // get owner
    function getOwner() external view returns (address);
}
