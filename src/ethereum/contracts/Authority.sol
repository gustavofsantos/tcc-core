pragma solidity ^0.4.25;

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
  mapping (address => UserEntity) users;

  modifier onlyAuthority() {
    require(
      msg.sender == authority,
      "Only the authority owner of this contract can run this"
    );
    _;
  }

  constructor(string attributesCID) public {
    authority = msg.sender;
    authorityAttributes = attributesCID;
  }

  function registerUser(string userName, string userPubKey) public payable onlyAuthority returns (address) {
    User user = new User(userName, userPubKey, address(0), address(0));
    address userAddress = address(user);
    users[userAddress] = UserEntity({ userContract: userAddress });
    return user;
  }

  function changeUserPublicKey(address userContractAddress, string newPublicKey) public onlyAuthority returns (address) {
    User oldContract = User(userContractAddress);
    string memory originalUserName = oldContract.getName();
    string memory originalUserPubKey = oldContract.getPublicKey();
    address originalUserContractAddress = oldContract.getOriginalAddress();

    // create a new user contract
    // Create a new user contract passing the public static values, the new public
    User user = new User(originalUserName, newPublicKey, userContractAddress, originalUserContractAddress);
    
    // get new user contract address
    address newUserContractAddress = address(user);

    // register modification
    users[originalUserContractAddress].userContract = newUserContractAddress;

    // disable old user contract and link to the new address
    oldContract.disableAndLinkToAnother(newUserContractAddress);

    return newUserContractAddress;
  }

  function changeUserName(address userContractAddress, string newUserCIDAttributes) public onlyAuthority {
    User oldContract = User(userContractAddress);

  }
}