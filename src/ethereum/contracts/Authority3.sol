pragma solidity ^0.4.24;

contract Authority3 {

  address authority;

  mapping (address => address) users;

  modifier onlyAuthority(address caller) {
    require (
      caller == authority,
      "Only the authority owner can call this"
    );
    _;
  }

  constructor () public {
    authority = msg.sender;
  }

  function registerUser(address userContractAddress) public onlyAuthority(msg.sender) {
    users[userContractAddress] = userContractAddress;
  }

  function changeUserLatestContract(address originalUserContract, address latestUserContract) 
  public onlyAuthority(msg.sender) {
    users[originalUserContract] = latestUserContract;
  }
}