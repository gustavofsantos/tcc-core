pragma solidity ^0.4.24;

contract Authority3 {

  address authority;

  mapping (address => address) users;

  event RegisterEvent(address caller, address userContract);

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

  function registerUser(address userContractAddress) public returns (bool) {
    require (
      msg.sender == authority,
      "Only the authority owner can call this"
    );

    emit RegisterEvent(msg.sender, userContractAddress);

    users[userContractAddress] = userContractAddress;
    return true;
  }

  function changeUserLatestContract(address originalUserContract, address latestUserContract) public returns (bool) {
    require (
      msg.sender == authority,
      "Only the authority owner can call this"
    );

    require(
      users[originalUserContract] != latestUserContract,
      "You cannot change a contract to the same contract"
    );

    users[originalUserContract] = latestUserContract;
    return true;
  }

  function getOwner() public view returns (address) {
    return authority;
  }
}