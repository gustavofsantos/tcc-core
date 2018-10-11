pragma solidity ^0.4.24;

contract User2 {

  address public userAddress; // User blockchain address
  string  public name;        // Full name
  string  public id;          // CPF like
  string  public location;    // Location person was born
  string  public publicKey;   // Person public key
  string  public attributes;  // IPFS CID

  modifier onlyUserAddress() {
    require(
      msg.sender == userAddress,
      "Only the owner of this contract can call this"
    );
    _;
  }
  
  constructor (string userName, string userID, string userLocation, string userPublicKey, string userAttributes) public {
    userAddress = msg.sender;

    // set public attributes
    name = userName;
    id = userID;
    location = userLocation;
    publicKey = userPublicKey;
    attributes = userAttributes;
  }

  function changePublicKey(string newKey) 
    public view onlyUserAddress 
  {

  }

  function getUserAttributes()
    public view returns (string)
  {
    return attributes;
  }
}