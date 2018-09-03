const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');

const web3 = new Web3(ganache.provider());

const userContractCompiled = require('../src/ethereum/build/User.json');

let accounts;
let user;

(async () => {
	accounts = await web3.eth.getAccounts();

	// User contract
	user = await new web3.eth.Contract(JSON.parse(userContractCompiled.interface))
		.deploy({
			data: userContractCompiled.bytecode,
			arguments: [
				"Gustavo",
				"public key is here"
			] 
		})
		.send({
			from: accounts[0],
			gas: '1000000'
		});

	const pubKey = await user.methods.getUserPublicKey().call() // call does not modify contract
	console.log('User.getUserPublicKey: ', pubKey);
})();