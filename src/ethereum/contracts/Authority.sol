pragma solidity ^0.4.24;

import "./User.sol";
import "./UserModification.sol";
import "./UserRegistration.sol";

contract Authority {

  struct UserEntity {
    address userContract;
  }

  address public authority;
  string public authorityAttributes;

  /* original address => user valid */
  mapping (address => address) users;

  modifier onlyAuthority() {
    require(
      msg.sender == authority,2
      "Only the authority owner of this contract can run this"
    );
    _;
  }

  constructor(string attributesCID) public {
    authority = msg.sender;
    authorityAttributes = attributesCID;
  }

  function registerUser(string userName, string userPubKey) 
    public payable onlyAuthority returns (User) {
    
    User user = new User(userName, userPubKey, address(0), address(0));
    users[user] = user;
    return user;
  }

  function changeUserPublicKey(User user, string newPublicKey) 
    public onlyAuthority returns (User) {

    string memory originalUserName = user.getName();
    address originalUserContractAddress = user.getOriginalAddress();

    // create a new user contract
    // Create a new user contract passing the public static values, the new public
    User newUser = new User(originalUserName, newPublicKey, address(user), originalUserContractAddress);

    // register modification
    users[originalUserContractAddress] = newUser;

    // disable old user contract and link to the new address
    user.disableAndLinkToAnother(address(newUser));

    return newUser;
  }

  function changeUserName(User user, string newUserName) public onlyAuthority returns (User) {
    string memory userPublicKey = user.getPublicKey();
    address originalUserContractAddress = user.getOriginalAddress();

    User newUser = new User(newUserName, userPublicKey, address(user), originalUserContractAddress);

    users[originalUserContractAddress] = newUser;

    user.disableAndLinkToAnother(address(newUser));

    return newUser;
  }
}