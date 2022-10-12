// SPDX-License-Identifier: UNLICENSED

pragma solidity >=0.7.0 <0.9.0;

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

    // change ownership of the post by paying the price
    function buy() external payable;

    // like the post
    function like() external;

    // change price of the post
    function changePrice(int64 _price) external;

    // get owner
    function getOwner() external view returns (address);

//    // event of Post creation
//    event PostCreated(address post);
//    // event of like
//    event Liked(address user);
//    // event of ownership change
//    event OwnershipChanged(address oldOwner, address newOwner);
//    // event of price change
//    event PriceChanged(int64 price);
}
