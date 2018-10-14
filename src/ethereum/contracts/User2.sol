pragma solidity ^0.4.24;

contract User2 {

  address public userAddress;       // User blockchain address
  address public nextContract;      // Address for the next contract double linked
  address public authorityAddress;  // Authority of this contract
  string  public name;              // Full name
  string  public id;                // CPF like
  string  public location;          // Location person was born
  string  public publicKey;         // Person public key
  string  public attributes;        // IPFS CID
  bool    public enable;            // Flag that tells if this contract is able to sign things

  modifier onlyUserAddress() {
    require(
      msg.sender == userAddress,
      "Only the owner of this contract can call this"
    );
    _;
  }

  modifier onlyAuthorityAddress(address addr) {
    require (
      addr == authorityAddress,
      "Only the authority can call this"
    );
    _;
  }
  
  constructor (
    string userName,
    string userID,
    string userLocation,
    string userPublicKey,
    string userAttributes,
    address vigentAuthorityAddress) 
    public
  {
    userAddress = msg.sender;

    // set public attributes
    name = userName;
    id = userID;
    location = userLocation;
    publicKey = userPublicKey;
    attributes = userAttributes;
    authorityAddress = vigentAuthorityAddress;
    nextContract = address(0);
  }

  function disableAndLinkToNew(address newUserContractAddress) 
    public onlyAuthorityAddress(msg.sender) returns (bool)
  {
    if (enable && nextContract == address(0)) {
      enable = false;
      nextContract = newUserContractAddress;
      return true;
    }
    return false;
  }

  function getUserAttributes()
    public view returns (string)
  {
    return attributes;
  }

  function isEnabled()
    public view returns (bool)
  {
    return enable;
  }
}