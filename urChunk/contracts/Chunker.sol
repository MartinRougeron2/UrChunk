// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.8.17;

import "./Chunk.sol";

contract Chunker is Ownable, Admin {
    string public _username;
    mapping(address => bool) public _following;
    mapping(address => bool) public _followers;
    uint256 public _followingCount;
    uint256 public _followersCount;
    int256 public _reputation;
    mapping(address => bool) public _chunks;
    uint256 public _chunksCount;

    event ChunkerCreated(address indexed chunkerAddress);
    event ChunkerDeleted(address indexed chunkerAddress);
    event Follow(address indexed chunkerAddressFollowed, address indexed chunkerAddressFollowBy);
    event Unfollow(address indexed chunkerAddress);
    event Unfollowed(address indexed chunkerAddress);

    modifier notOwner(address _address) {
        require(_address != owner(), "Address cannot be owner");
        _;
    }

    constructor(string memory username) Ownable() Admin(0x4343C7656DA5f4fB7e3cC80DCd2E1611b3E61f4D) {
        _username = username;
        _followingCount = 0;
        _followersCount = 0;
        emit ChunkerCreated(address(this));
    }

    function followersAdd(address userFollowingAddress) public zeroAddress(userFollowingAddress) notOwner(userFollowingAddress) {
        require(!_followers[userFollowingAddress], "You already follow this chunker");

        _followers[userFollowingAddress] = true;
        _followersCount++;
    }

    function follow(address userToFollowAddress) public onlyOwner zeroAddress(userToFollowAddress) notOwner(userToFollowAddress) {
        emit Follow(userToFollowAddress, address(this));
        _following[userToFollowAddress] = true;
        _followingCount++;

        Chunker userToFollow = Chunker(userToFollowAddress);
        userToFollow.followersAdd(address(this));
    }

    function createChunk(string memory linkToContent) public onlyOwner {
        Chunk chunk = new Chunk(linkToContent, address(this));
        _chunks[address(chunk)] = true;
        _chunksCount++;
    }

    function deleteChunk(address chunkAddress) public onlyOwner {
        require(_chunks[chunkAddress], "Chunk does not exist");
        Chunk chunk = Chunk(chunkAddress);
        _chunks[chunkAddress] = false;
        _chunksCount--;
        chunk.deleteChunk();
    }

    function unfollow(address userToUnfollowAddress) public onlyOwner zeroAddress(userToUnfollowAddress) {
        require(_following[userToUnfollowAddress], "You don't follow this chunker");

        emit Unfollow(userToUnfollowAddress);
        _following[userToUnfollowAddress] = false;
        _followingCount--;

        Chunker userToUnfollow = Chunker(userToUnfollowAddress);
        userToUnfollow.followersRemove(owner());
    }

    function followersRemove(address userFollowingAddress) public zeroAddress(userFollowingAddress) {
        require(_followers[userFollowingAddress], "You don't follow this chunker");
        emit Unfollowed(userFollowingAddress);
        _followers[userFollowingAddress] = false;
        _followersCount--;
    }

    function changeReputation(int256 newReputation) public onlyAdmin {
        _reputation = newReputation;
    }

    function changeUsername(string memory newUsername) public onlyOwner {
        _username = newUsername;
    }

    function changeOwner(address newOwner) public onlyOwner zeroAddress(newOwner) {
        transferOwnership(newOwner);
    }

    function deleteChunker() public onlyOwner {
        emit ChunkerDeleted(address(this));
        selfdestruct(payable(owner()));
    }

    function deleteChunkerByAdmin() public onlyAdmin {
        emit ChunkerDeleted(address(this));
        selfdestruct(payable(owner()));
    }
}