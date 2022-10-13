// SPDX-License-Identifier: UNLICENSED

pragma solidity >=0.7.0 <0.9.0;

interface IUser {
    struct User {
        string name;
        string email;
        address owner;
        mapping(address => bool) posts;
        mapping(address => bool) followers;
        uint256 followingCount;
    }

    // update user name
    function updateName(string memory _name) external;

    // update user email
    function updateEmail(string memory _email) external;

    // get email
    function getEmail() external view returns (string memory);

    // create a new post
    function createPost(string memory _title, string memory _content, int64 _price) external returns (address);

    // get posts length
    function getPostsLength() external view returns (uint256);

    // buy a post
    function buyPost(address _post) external payable;

    // detect if a post is owned by the user
    function isPostOwner(address _post) external view returns (bool);

    // user follow another user
    function follow(address _user) external;

    // get user followers count
    function getFollowingCount() external view returns (uint256);

    // remove a post from the user if not owned by the user
    function removePost(address _post) external;

    // transfer ownership of the user
    function transferOwnership(address _newOwner) external;

    // buy a user
    function buyUser() external payable;


//    // event of name update
//    event NameUpdated(string name);
//    // event of email update
//    event EmailUpdated(string email);
//    // event of post creation
//    event PostCreated(address post);
//    // event of post sold
//    event PostSold(address post);
//    // event of following another user
//    event Followed(address user);
//    // event of ownership transfer
//    event OwnershipTransferred(address oldOwner, address newOwner);
//    // event of user bought
//    event UserBought(address user);
}
