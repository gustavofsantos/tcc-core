pragma solidity ^0.4.25;

import "./User.sol";
import "./UserModification.sol";
import "./UserRegistration.sol";

contract UserDeployed {
  function getName() public view returns (string);
  function getPublicKey() public view returns (string);
  function getOriginalAddress() public view returns (address);
  function disableAndLinkToAnother(address nextContract) public;
}

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

  function registerUser(string userName, string userPubKey) public onlyAuthority returns (address) {
    User user = new User(userName, userPubKey, address(0), address(0));
    address userAddress = address(user);
    users[userAddress] = UserEntity({ userContract: userAddress });
    return userAddress;
  }

  function changeUserContract(address userContract) public onlyAuthority returns (address) {
    UserDeployed oldContract = UserDeployed(userContract);
    string memory userName = oldContract.getName();
    string memory userPubKey = oldContract.getPublicKey();
    address originalUserContract = oldContract.getOriginalAddress();

    // create a new user contract
    User user = new User(userName, userPubKey, userContract, originalUserContract);
    
    // get new user contract address
    address newUserContractAddress = address(user);

    // register modification
    users[originalUserContract].userContract = newUserContractAddress;

    // disable old user contract and link to the new address
    oldContract.disableAndLinkToAnother(newUserContractAddress);

    return newUserContractAddress;
  }

  function changeUserAttributes(address userAddress, string newUserCIDAttributes) public onlyAuthority {

  }
}