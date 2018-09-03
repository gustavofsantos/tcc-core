pragma solidity ^0.4.24;

contract User {
  
  struct UserInfo {
    string name;
    string publicKey;
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

  constructor(/*address contractOwner,*/ string name, string publicKey) public {
    owner = msg.sender;
    // owner = contractOwner;
    userInfo = UserInfo({
      name: name,
      publicKey: publicKey
    });
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