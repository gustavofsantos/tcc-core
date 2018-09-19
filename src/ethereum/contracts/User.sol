pragma solidity ^0.4.24;

contract User {
  struct UserInfo {
    string name;
    string publicKey;
    address originalAddress;
  }
  
  struct Document {
    string signature;
  }
  
  address public authority;
  address public owner;
  address public next;
  address public last;
  bool private valid;
  UserInfo public userInfo;
  
  // user info 
  string public name;
  string public publicKey;
  address public originalAddress;
  
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

  constructor(string userName, string userPublicKey, address lastContract, address originalContractAddress) public {
    authority = msg.sender;
    last = lastContract;
    name = userName;
    publicKey = userPublicKey;
    
    if (originalContractAddress == address(0)) {
      originalAddress = address(this);
    } else {
      originalAddress = originalContractAddress;
    }
    
    valid = true;
  }

  function disable() private {
    valid = false;
  }

  function disableAndLinkToAnother(address nextContract) public onlyAuthority {
    disable();
    next = nextContract;
  }
  
  function getName() public view returns (string) {
    return name;
  }

  function getPublicKey() public view returns (string) {
    return publicKey;
  }
  
  function getOriginalAddress() public view returns (address) {
    return originalAddress;
  }

  function addDocument(string documentCID, string documentSignatureCID) public onlyAuthority {
    // document is a "pointer" that has documentCID as key
    documents[documentCID] = Document({ signature: documentSignatureCID });
  }

  function getSignatureOf(string documentCID) public view returns (string) {
    return documents[documentCID].signature;
  }
}