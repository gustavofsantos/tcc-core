pragma solidity ^0.4.24;

contract User3 {

  // REQUIRED TO ALL CONTRACTS
  address owner;
  address lastContract;
  address nextContract;
  address originalContract;

  string  cid;
  string  publicKey;
  bool    enable;

  mapping (string => bool) signed;
  mapping (string => bool) secureDevicesPublicKeys;
  mapping (address => bool) authorities;

  // MODIFIERS
  modifier onlyUser(address caller) {
    require(
      caller == owner && enable == true,
      "Only the user that own this contract can call this"
    );
    _;
  }

  modifier onlyAuthority(address caller) {
    require(
      authorities[caller] == true && enable == true,
      "Only the authority that has registered this contract can call this"
    );
    _;
  }

  modifier onlyIfNotRegisteredAt(address authority) {
    require (
      authorities[authority] && enable == true,
      "This only can be called if not registered"
    );
    _;
  }

  constructor (string userCID, string userPublicKey, address userOriginalContract, address userLatestContract) public {
    owner = msg.sender;
    cid = userCID;
    publicKey = userPublicKey;
    originalContract = userOriginalContract;
    lastContract = userLatestContract;

    // setting data
    enable = true;
    nextContract = address(0);
  }

  function registerToAuthority(address authorityAddress) public onlyUser(msg.sender) onlyIfNotRegisteredAt(authorityAddress) returns (bool) {
    if (authorities[authorityAddress] != true) {
      authorities[authorityAddress] = true;
      return true;
    } else {
      return false;
    }
  }

  function isRegisteredByAuthority(address authority) public view returns (bool) {
    return authorities[authority];
  }

  function setSecureDevicePublicKey(string devicePublicKey) public onlyUser(msg.sender)  {
    require(secureDevicesPublicKeys[devicePublicKey] != true);

    secureDevicesPublicKeys[devicePublicKey] = true;
  }

  function disableSecureDevice(string devicePublicKey) public onlyUser(msg.sender) {
    secureDevicesPublicKeys[devicePublicKey] = false;
  }

  function getPublicKey() public view returns (string) {
    return publicKey;
  }

  function getCID() public view returns (string) {
    return cid;
  }

  function getNextContract() public view returns (address) {
    return nextContract;
  }

  function getLastContract() public view returns (address) {
    return lastContract;
  }

  function getOriginalContract() public view returns (address) {
    return originalContract;
  }

  function getOwner() public view returns (address) {
    return owner;
  }

  function disableAndLinkToNew(address newUserContract) public onlyAuthority(msg.sender) returns (bool) {
    // disable the contract
    enable = false;

    // then set the new contract address
    nextContract = newUserContract;
  }

  function signData(string cidDataSigned) public onlyUser(msg.sender) returns (bool) {
    if (signed[cidDataSigned] != true) {
      signed[cidDataSigned] = true;
      return true;
    } else {
      return false;
    }
  }

  function isSigned(string cidDataSigned) public view returns (bool) {
    return signed[cidDataSigned];
  }
}