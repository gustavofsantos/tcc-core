pragma solidity 0.4.24;

contract UserModification {
  
  address public oldUserAddress;
  address public newUserAddress;
  address public authorityAddress;
  address public contractAddress;

  constructor(address oldUser, address newUser, address authority) public {
    oldUserAddress = oldUser;
    newUserAddress = newUser;
    authorityAddress = authority;
    contractAddress = msg.sender;
  }
}