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

  function registerUser(address userContractAddress) public {

    emit RegisterEvent(msg.sender, userContractAddress);

    users[userContractAddress] = userContractAddress;
  }

  function changeUserLatestContract(address originalUserContract, address latestUserContract) 
    public onlyAuthority(msg.sender)
  {
    users[originalUserContract] = latestUserContract;
  }

  function getOwner() public view returns (address) {
    return authority;
  }
}