pragma solidity 0.4.24;

contract Authority {
  address public authority;

  // Ethereum contract address => IPFS CID attributes
  mapping(address => string) users;

  modifier onlyAuthority() {
    require(msg.sender == authority);
    _;
  }

  constructor() public {
    authority = msg.sender;
  }

  registerUser(address userContract, string userAttributes) public onlyAuthority {
    users[userContract] = userAttributes;
  }
}
