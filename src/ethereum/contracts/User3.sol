pragma solidity ^0.4.24;

contract User3 {

  event AuthorityCall(address caller, address owner);
  event UserCall(address caller, address owner);

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
    emit UserCall(caller, owner);
    require(
      caller == owner,
      "Only the user that own this contract can call this"
    );
    _;
  }

  modifier onlyAuthority(address caller) {
    emit AuthorityCall(caller, owner);
    require(
      authorities[caller] == true,
      "Only the authority that has registered this contract can call this"
    );
    _;
  }

  modifier onlyIfNotRegisteredAt(address authority) {
    require (
      authorities[authority] != true,
      "This only can be called if not registered"
    );
    _;
  }

  modifier onlyEnabled() {
    require(
      enable == true,
      "The contract need to be enabled"
    );
    _;
  }

  modifier onlyDeviceNotSetted(string devicePublicKey) {
    require(
      secureDevicesPublicKeys[devicePublicKey] != true,
      "Secure device public key already exists"
    );
    _;
  }

  modifier onlyDeviceSetted(string devicePublicKey) {
    require(
      secureDevicesPublicKeys[devicePublicKey] == true,
      "Secure device public key not exists"
    );
    _;
  }

  modifier onlyNotSigned(string cidDataSigned) {
    require(
      signed[cidDataSigned] != true,
      "Data is already signed"
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

  function registerToAuthority(address authorityAddress) public
    onlyUser(msg.sender)
    onlyEnabled()
    onlyIfNotRegisteredAt(authorityAddress) returns (bool) 
  {
    authorities[authorityAddress] = true;
    return authorities[authorityAddress];
  }

  function isRegisteredByAuthority(address authority) public view returns (bool) {
    return authorities[authority];
  }

  function setSecureDevicePublicKey(string devicePublicKey) public 
    onlyUser(msg.sender)
    onlyDeviceNotSetted(devicePublicKey)
    onlyEnabled()
  {
    secureDevicesPublicKeys[devicePublicKey] = true;
  }

  function disableSecureDevice(string devicePublicKey) public 
    onlyUser(msg.sender)
    onlyEnabled()
  {
    secureDevicesPublicKeys[devicePublicKey] = false;
  }

  function disableAndLinkToNew(address newUserContract) public 
    onlyEnabled()
    onlyAuthority(msg.sender) returns (bool)
  {
    // disable the contract
    enable = false;
    // then set the new contract address
    nextContract = newUserContract;

    return true;
  }

  function signData(string cidDataSigned) public
    onlyUser(msg.sender)
    onlyEnabled()
    onlyNotSigned(cidDataSigned) returns (bool) 
  {
    signed[cidDataSigned] = true;
    return true;
  }

  function isSigned(string cidDataSigned) public view returns (bool) {
    return signed[cidDataSigned];
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
}