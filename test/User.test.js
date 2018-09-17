const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const fs = require('fs');
const crypto = require('crypto');

const web3 = new Web3(ganache.provider());

const userContractCompiled = require('../src/ethereum/build/User.json');
const authorityContractCompiled = require('../src/ethereum/build/Authority.json');

const authority = {};
const user1 = {};
const user2 = {};
const user3 = {};

function genKeyPair(format='hex', private='senha') {
	const pair = crypto.createDiffieHellman(256);
	pair.setPrivateKey(Buffer.from(private));
	pair.generateKeys();
	const priv = pair.getPrivateKey(format);
	const pub = pair.getPublicKey(format);

	return { priv, pub };
}

function getAccounts() {
	return new Promise(resolve => 
		web3.eth.getAccounts()
			.then(accounts => resolve(accounts)));
}

function authorityAddress() {
	return new Promise((resolve, reject) => {
		if (authority.account) {
			resolve(authority.account);
		} else {
			getAccounts().then(accounts => {
				if (accounts) {
					authority.account = accounts[0];
					resolve(accounts[0]);
				} else {
					reject('Accounts array is empty');
				}
			});
		}
	});
}

function authorityPairKeys() {
	return new Promise(resolve => {
		if (authority.privKey && authority.pubKey) {
			resolve({
				priv: authority.privKey,
				pub: authority.pubKey
			});
		} else {
			const { priv, pub } = genKeyPair();
			authority.privKey = priv;
			authority.pubKey = pub;
			resolve({ priv, pub });
		}
	})
}


function userAccount1() {
	return new Promise((resolve, reject) => {
		getAccounts().then(accounts => {
			if (accounts) {
				resolve(accounts[1]);
			} else {
				reject('Accounts array is empty');
			}
		});
	});
}

function user1PairKeys() {
	return new Promise(resolve => {
		if (user1.privKey && user1.pubKey) {
			resolve({
				priv: user1.privKey,
				pub: user1.pubKey
			});
		} else {
			const { priv, pub } = genKeyPair();
			user1.privKey = priv;
			user1.pubKey = pub;
			resolve({ priv, pub });
		}
	});
}

function authorityContract(data) {
	return new Promise((resolve) => {
		if (authority.contract) {
			resolve(authority.contract);
		} else {
			const futureContract = new web3.eth.Contract(JSON.parse(authorityContractCompiled.interface))
				.deploy({
					data: authorityContractCompiled.bytecode,
					// arguments: [
					// 	data.authorityName,
					// 	data.authorityPubKey
					// ]
				})
				.send({
					from: data.authorityAccount,
					gas: '1000000'
				});
	
			futureContract.then(contract => {
				if (contract) {
					authority.contract = contract;
					resolve(contract);
				} else {
					reject('Contract does not exist');
				}
			});
		}
	})
}

function deployUserContract(data) {
	return new Promise((resolve, reject) => {
		const futureContract = new web3.eth.Contract(JSON.parse(userContractCompiled.interface))
			.deploy({
				data: userContractCompiled.bytecode,
				arguments: [
					data.userName,
					data.userPubKey
				] 
			})
			.send({
				from: data.authorityAccount,
				gas: '1000000'
			});
		
		futureContract.then(contract => {
			if (contract) {
				resolve(contract);
			} else {
				reject('Contract does not exist');
			}
		})
	});
}

function test() {
	describe("User Contract Testing", () => {
		describe("Get Accounts from Provider", () => {
			it("Get 10 accounts", () => {
				getAccounts().then(accounts => {
					console.log('[accounts] ', accounts);
					assert(accounts.length === 10);
				});
			});
		});

		describe("Set Authority account as first account of array", () => {
			it("Athority account shoud exists", () => {
				authorityAddress()
					.then(address => {
						if (address) {
							assert(true);
						} else {
							assert(false);
						}
					})
					.catch(error => {
						console.log(error);
						assert(false);
					});
			});
		});

		describe("Create Authority keys", () => {
			it("Keys should exist", () => {
				authorityPairKeys().then(pair => {
					const { priv, pub } = pair;
					assert(priv && pub);
				});
			})
		});

		describe("Deploy Authority Contract", () => {
			it("Authority contract should exist in the blockchain", () => {
				authorityPairKeys()
				.then(pair => {
					const { priv, pub } = pair;
	
					authorityAddress()
					.then(authorityAccount => {
						authorityContract({
							authorityName: 'Authority 01',
							authorityPubKey: pub,
							authorityAccount: authorityAccount
						})
						.then(authorityContract => {
							if (authorityContract) {
								assert(true);
							} else {
								assert(false);
							}
						})
					})
				})
			})
		})

		describe("Deploy User Contract 1", () => {
			it("User 1 contract shoud exist in blockchain", () => {
				authorityAddress().then(authorityAddress => {
					userAccount1().then(account => {
						user1PairKeys().then(pair => {
							deployUserContract({
								userName: 'Gustavo Fernandes dos Santos',
								userPubKey: pair.pub,
								authorityAccount: authorityAddress
							})
							.then(user => {
								user.methods.getUserPublicKey()
									.call() // call does not modify contract
									.then(pubKey => {
										console.log('User.getUserPublicKey: ', pubKey);
										assert(pair.pub === pubKey);
									});
							});
						})
					});
				})
			})
		});
	});
}

test();