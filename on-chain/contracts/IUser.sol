// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.8.17;

interface IUser {
    struct User {
        // user's name
        string name;
        // user's address
        string email;
        // user's address
        address payable owner;
        // user's posts
        address[] posts;
        // user's followers
        mapping(address => bool) following;
        // user's followers count
        uint256 followingCount;
        // price of the user
        int64 price;
    }

    // event of user creation
    event UserCreated(address user);
    // event of name update
    event NameUpdated(string name);
    // event of email update
    event EmailUpdated(string email);
    // event of post creation
    event PostCreatedFromUser(address post);
    // event of post buy
    event PostBuyFromUser(address post);
    // event of post sold
    event PostSold(address post);
    // event of following another user
    event Followed(address user);
    // event of ownership transfer
    event OwnershipTransferred(address oldOwner, address newOwner);
    // event of user bought
    event UserBought(address user);

    // update user name
    function updateName(string memory _name) external;

    // update user email
    function updateEmail(string memory _email) external;

    // get email
    function getEmail() external view returns (string memory);

    // transfer ownership of the user
    function transferOwnership(address _newOwner) external;

    // buy a user
    function buyUser() external payable;

    // create a new post
    function createPost(string memory _title, string memory _content, uint64 _price) external returns (address);

    // buy a post
    function buyPost(address _post) external payable;

    // detect if a post is owned by the user
    function isPostOwner(address _post) external view returns (bool);

    // user follow another user
    function follow(address _user) external;

    // get user followers count
    function getFollowingCount() external view returns (uint256);
}
