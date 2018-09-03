pragma solidity 0.4.24;

contract Authority {
	address public authority;

	constructor() public {
		authority = msg.sender;
	}
}