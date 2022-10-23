// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.8.17;

import "./Ownable.sol";
import "./Admin.sol";

contract Chunk is Ownable, Admin {
    string _linkToContent;
    address _author; // Chunker address ! NOT owner

    event ChunkCreated(address indexed chunkAddress);
    event ChunkDeleted(address indexed chunkAddress);

    constructor(string memory linkToContent, address chunker) Ownable() zeroAddress(chunker) Admin(0x4343C7656DA5f4fB7e3cC80DCd2E1611b3E61f4D) {
        _linkToContent = linkToContent;
        _author = chunker;
        emit ChunkCreated(address(this));
    }

    function deleteChunk() public onlyOwner {
        emit ChunkDeleted(address(this));
        selfdestruct(payable(owner()));
    }

    function deleteChunkByAdmin() public onlyAdmin {
        emit ChunkDeleted(address(this));
        selfdestruct(payable(owner()));
    }

    function changeLinkToContent(string memory linkToContent) public onlyOwner {
        _linkToContent = linkToContent;
    }

    function changeAuthor(address chunker) public onlyOwner zeroAddress(chunker) {
        _author = chunker;
    }

    function changeOwner(address newOwner) public onlyOwner {
        transferOwnership(newOwner);
    }
}