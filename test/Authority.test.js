const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const fs = require('fs');
const crypto = require('crypto');
const { genUsers } = require('../src/utils/utils');

const web3 = new Web3(ganache.provider({ gasLimit: 30000000 }));

// const userContractCompiled = require('../src/ethereum/build/User.json');
// const authorityContractCompiled = require('../src/ethereum/build/Authority.json');

const authorityABI = fs.readFileSync('src/ethereum/build/Authority.abi');
const authorityBIN = fs.readFileSync('src/ethereum/build/Authority.bin');

let authority;
const users = genUsers(10);

function test() {
  console.log('\tAuthority Contract Test');
  console.log('\t=======================');

  console.log('\t\tDeploy Authority Contract');
  authorityAddress().then(address => {
    deployAuthorityContract(address).then(authority => {
      if (authority) {
        registerUsers(authority).then(futureAddresses => {
          if (addresses.length === users.length) {
            console.log(addresses);
            
            // select addresses[0] to change user public key
            addresses[0].then(userAddress => {
              changeUserKey(userAddress, "nova chave publica")
                .then(newUserAddress => {
                  
                })
            })
          }
        });
      } else {
        console.log('\t\t\tFAIL');
      }
    }).catch(err => {
      console.log('Error deploying Authority contract.');
    });
  }).catch(err => {
    console.log('Error getting authority address');
  })
}

test();


/** ------------------------------------------------------------------- **/

async function deployAuthorityContract(fromAddress) {
  const contract = await new web3.eth.Contract(JSON.parse(authorityABI));

  contract
    .deploy({
      data: authorityBIN,
      arguments: [
        "authority cid string"
      ]
    })
    .send({
      from: fromAddress,
      gas: '3000000'
    })
    .on('error', err => {
      console.log('Error: ', err);
    })
    .on('receipt', receipt => {
      console.log('Authority Contract address: ', receipt.contractAddress);
  });

  return contract;
}

function registerUsers(authority, address) {
  return new Promise((resolve, reject) => {
    const futureAddresses = users.map(user =>
      authority
        .methods
        .registerUser(user.name, user.pubKey)
        .call({
          from: address
        }));

    if (futureAddresses)
      resolve(futureAddresses);
    else
      reject('Cannot register all users');
  });
}

function changeUserKey(authority, authorityAddress, lastUserContractAddress, newPublicKey) {
  return new Promise((resolve, reject) => {
    const futureNewUserAddress = authority
      .methods
      .changeUserContract(lastUserContractAddress, newPublicKey)
      .call({
        from: authorityAddress
      });

    futureNewUserAddress
      .then(address => {
        resolve(address);
      })
      .catch(reject);
  })
}

function authorityAddress() {
  return new Promise((resolve, reject) => {
    getAccounts().then(addresses => {
      if (addresses) resolve(addresses[0]);
      else reject('Addresses is empty');
    });
  });
}

function getAccounts() {
	return new Promise(resolve =>
		web3.eth.getAccounts()
			.then(accounts => resolve(accounts)));
}

function computeAuthorityStats(authority) {
  // console.log(authority);
  // console.log('Estimate Gas', authority.estimateGas());
}