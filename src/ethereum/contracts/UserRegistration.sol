pragma solidity 0.4.25;

import "./User.sol";

contract UserRegistration {
    
  User userContract;
  address invocator;
  
  constructor(address userAddr) public {
    User user = User(userAddr);
    userContract = user;
    invocator = msg.sender;
  }
  
  function getUserName() public returns (string) {
    string memory name = userContract.getName();
    return name;
  }
}