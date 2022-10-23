// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.8.17;


abstract contract Admin {
    address public _admin;

    event AdminChanged(address admin);

    modifier onlyAdmin() {
        require(msg.sender == _admin, "Sender is not admin");
        _;
    }

    modifier zeroAddress(address addressToCheck) {
        require(addressToCheck != address(0), "Address cannot be null");
        _;
    }

    constructor(address admin) zeroAddress(_admin) {
        _admin = admin;
    }


    function changeAdmin(address newAdmin) public onlyAdmin zeroAddress(newAdmin) {
        emit AdminChanged(newAdmin);
        _admin = newAdmin;
    }
}