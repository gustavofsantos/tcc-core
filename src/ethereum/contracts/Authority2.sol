pragma solidity ^0.4.24;

contract Authority2 {
  string public authorityCID;
  address public authorityAddress;
  address[] public originalUserContractAddresses;

  // original contract address => latest contract address
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

  function registerUser(address originalContractAddress) 
    public onlyAuthorityAddress returns (bool)
  {
    // theres no way to check if an address is a real address, but the process
    // will throw an error if the address isn't valid
    require(
      originalContractAddress != address(0),
      "Addresses should not be empty"
    );

    if (users[originalContractAddress] != address(0)) {
      return false;
    } else {
      users[originalContractAddress] = originalContractAddress;
      originalUserContractAddresses.push(originalContractAddress);
      return true;
    }
  }

  function changeLatestContract(address originalContractAddress, address latestContractAddress)
    public onlyAuthorityAddress returns (bool)
  {
    users[originalContractAddress] = latestContractAddress;
    return true;
  }

  function originalContractAddressAtIndex(uint index)
    public view returns (address)
  {
    return originalUserContractAddresses[index];
  }

  function originalUserContractAddressesLength()
    public view returns (uint)
  {
    return originalUserContractAddresses.length;
  }

  function getAuthorityAttributesCID() public view returns (string) {
    return authorityCID;
  }
}