pragma solidity ^0.4.24;

contract User {
  
  struct UserInfo {
    string name;
    string publicKey;
    address rescueContract;
  }
  
  struct Document {
    string signature;
  }
  
  address public deployer;
  address public owner;
  UserInfo userInfo;
  
  // IPFS CID (document) -> IPFS CID (signature)
  mapping (string => Document) documents;
  
  modifier onlyOwner() {
    require(
      msg.sender == owner,
      "Only the owner of this contract can execute this"
    );
    _;
  }
  
  modifier onlyAuthority() {
    require(
      "Only the authority that has deployed this contract can execute this"
      msg.sender == deployer
    );
    _;
  }

  constructor(string name, string publicKey) public {
    owner = msg.sender;
    // owner = contractOwner;
    userInfo = UserInfo({
      name: name,
      publicKey: publicKey
    });
  }

  /* This function can append a new contract to this */
  function transferOwnership(address newUserContract) public onlyAuthority {
    userInfo.rescueContract = newUserContract;
  }

  function getUserPublicKey() public returns (string) {
    return userInfo.publicKey;
  }

  function addDocument(string documentCID, string documentSignatureCID) public onlyOwner {
    // document is a "pointer" that has documentCID as key
    documents[documentCID] = Document({ signature: documentSignatureCID });
  }

  function getSignatureOf(string documentCID) public returns (string) {
    return documents[documentCID].signature;
  }
}
