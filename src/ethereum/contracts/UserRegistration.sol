pragma solidity 0.4.24;

contract UserRegistration {
  
  address public contractDeployer;
  address public authority;
  address public user;

  constructor(address userAddress, address authorityAddress) public {
    contractDeployer = msg.sender;
    authority = authorityAddress;
    user = userAddress;
  }
}