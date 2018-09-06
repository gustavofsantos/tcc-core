const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');

const mocha = require('mocha');

const web3 = new Web3(ganache.provider());

const userContractCompiled = require('../src/ethereum/build/User.json');

let accounts;
let user;

describe("User Contract Test", async () => {
    accounts = await web3.eth.getAccounts();

    it("should deploy one user contract", async () => {
	// User contract
	user = await new web3.eth.Contract(JSON.parse(userContractCompiled.interface))
	    .deplo({
		data: userContractCompiled.bytecode,
		arguments: [
		    "Gustavo",
		    "12E4"
		]
	    })
	    .send({
		from: accounts[0],
		gas: '1000000'
	    });
	assert(user);
    });

    it("should get user public key", async () => {
	// call does not modify contract
	const pubKey = await user.methods.getUserPublicKey().call()
	assert.equal(pubKey, "12E4");
    })
})
