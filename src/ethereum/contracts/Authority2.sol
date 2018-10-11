pragma solidity ^0.4.24;

contract Authority2 {
  string public authorityCID;
  address public authorityAddress;

  mapping (address => address) users;

  modifier onlyAuthorityAddress() {
    require (
      msg.sender == authorityAddress,
      "Only the authority can run this"
    );
    _;
  }

  constructor (string authorityAttributesCID) public {
    authorityCID = authorityAttributesCID;
    authorityAddress = msg.sender;
  }

  function registerUser(address userAddress, address userContractAddress) 
    public onlyAuthorityAddress returns (bool)
  {
    // theres no way to check if an address is a real address, but the process
    // will throw an error if the address isn't valid
    require(
      userAddress != address(0) && userContractAddress != address(0),
      "Addresses should not be empty"
    );
    
    users[userContractAddress] = userAddress;
  }

  function getAuthorityAttributesCID() public view returns (string) {
    return authorityCID;
  }
}