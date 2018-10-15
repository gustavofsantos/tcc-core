pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

contract User2 {

  address public userAddress;       // User blockchain address
  address public nextContract;      // Address for the next contract double linked
  address public originalContract;  // First user contract address
  address public authorityAddress;  // Authority of this contract
  string  public name;              // Full name
  string  public id;                // CPF like
  string  public location;          // Location person was born
  string  public publicKey;         // Person public key
  string  public attributes;        // IPFS CID
  bool    public enable;            // Flag that tells if this contract is able to sign things

  string[] public secureDevicesPublicKeys;

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
    address vigentAuthorityAddress,
    address userOriginalContractAddress,
    string[] userSecureDevicesPublicKeys)
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
    originalContract = userOriginalContractAddress;
    nextContract = address(0);
    secureDevicesPublicKeys = userSecureDevicesPublicKeys;

    // set enabled
    enable = true;
  }

  function getUserName() public view returns (string) {
    return name;
  }

  function getUserID() public view returns (string) {
    return id;
  }

  function getUserLocation() public view returns (string) {
    return location;
  }

  function getUserPublicKey() public view returns (string) {
    return publicKey;
  }

  function getUserAttributes() public view returns (string) {
    return attributes;
  }

  function getAuthorityThatHaveRegisterOfThisContract() public view returns (address) {
    return authorityAddress;
  }

  function getOriginalUserContractAddress() public view returns (address) {
    return originalContract;
  }

  function getNextContract() public view returns (address) {
    return nextContract;
  }

  function disableAndLinkToNew(address newUserContractAddress) 
    public onlyAuthorityAddress(msg.sender) returns (bool)
  {
    if (enable) {
      enable = false;
      nextContract = newUserContractAddress;
      return true;
    } else {
      return false;
    }
  }

  function isEnabled()
    public view returns (bool)
  {
    return enable;
  }
}