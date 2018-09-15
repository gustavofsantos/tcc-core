pragma solidity ^0.4.24;

contract User {
  
  struct UserInfo {
    string name;
    string publicKey;
  }
  
  struct Document {
    string signature;
  }
  
  address public authority;
  address public owner;
  address public next;
  address public last;
  bool private valid;
  UserInfo userInfo;
  
  // IPFS CID (document) -> IPFS CID (signature)
  mapping (string => Document) documents;
  
  modifier onlyOwner() {
    require(
      msg.sender == owner && valid,
      "Only the owner of this contract can execute this"
    );
    _;
  }

  modifier onlyAuthority() {
    require(
      msg.sender == authority && valid,
      "Only the authority can execute this"
    );
    _;
  }

  constructor(string name, string publicKey, address lastContract) public {
    owner = msg.sender;
    last = lastContract;
    // owner = contractOwner;
    userInfo = UserInfo({
      name: name,
      publicKey: publicKey
    });
    valid = true;
  }

  function disable() private {
    valid = false;
  }

  function disableAndLinkToAnother(address nextContract) public onlyAuthority {
    disable();
    next = nextContract;
  }

  function getUserPublicKey() public view returns (string) {
    return userInfo.publicKey;
  }

  function addDocument(string documentCID, string documentSignatureCID) public onlyOwner {
    // document is a "pointer" that has documentCID as key
    documents[documentCID] = Document({ signature: documentSignatureCID });
  }

  function getSignatureOf(string documentCID) public view returns (string) {
    return documents[documentCID].signature;
  }
}