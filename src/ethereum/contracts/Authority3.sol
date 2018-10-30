pragma solidity ^0.4.24;

contract Authority3 {

  event RegisterEvent(address caller, address userContract);
  event ChangeUserContract(address latestContract);

  address authority;
  string  cid;

  mapping (address => address) users;

  modifier onlyAuthority(address caller) {
    require (
      caller == authority,
      "Only the authority owner can call this"
    );
    _;
  }

  modifier onlyDifferentContract(address original, address latest) {
    require(
      users[original] != latest,
      "You cannot change a contract to the same contract"
    );
    _;
  }

  constructor (string authorityCID) public {
    authority = msg.sender;
    cid = authorityCID;
  }

  function registerUser(address userContractAddress) public onlyAuthority(msg.sender) returns (bool) {
    users[userContractAddress] = userContractAddress;
    emit RegisterEvent(msg.sender, userContractAddress);

    return true;
  }

  function changeUserLatestContract(address originalUserContract, address latestUserContract) public 
    onlyAuthority(msg.sender)
    onlyDifferentContract(originalUserContract, latestUserContract) returns (bool) 
  {  
    users[originalUserContract] = latestUserContract;
    emit ChangeUserContract(latestUserContract);

    return true;
  }

  function getOwner() public view returns (address) {
    return authority;
  }
}