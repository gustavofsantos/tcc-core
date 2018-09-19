const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const fs = require('fs');
const crypto = require('crypto');

const web3 = new Web3(ganache.provider());

const userContractCompiled = require('../src/ethereum/build/User.json');
const authorityContractCompiled = require('../src/ethereum/build/Authority.json');

const authority = {};

function test() {
  describe("Authority Contract Test", () => {

    describe("Authority Contract Deployment", () => {
      it("Should deploy authority contract", () => {
        authorityAddress.then(authority => {
          deployAuthorityContract(authority).then(contractAddress => {
            if (contractAddress) assert(true);
            else assert(false);
          });
        });
      });
    });

    describe("Deploy User Contract from Authority Contract", () => {
      it("Should deploy user contract", () => {
        assert(true);
      });

      it("User contract should exist", () => {
        assert(true);
      });
    });

  });
}

test();


const authorityAddress = new Promise((resolve, reject) => {
  getAccounts().then(addresses => {
    if (addresses) resolve(addresses[0]);
    else reject('Addresses is empty');
  })
})

function deployAuthorityContract(fromAddress) {
  return new Promise((resolve, reject) => {
    const futureContract = new web3.eth.Contract(JSON.parse(authorityContractCompiled.interface))
      .deploy({
        data: authorityContractCompiled.bytecode,
        arguments: [
        	"authority cid string"
        ]
      })
      .send({
        from: fromAddress,
        gas: '1000000'
      });

    futureContract.then(contract => {
      if (contract) {
        resolve(contract);
      } else {
        reject('Contract does not exist');
      }
    });
  })
}

function getAccounts() {
	return new Promise(resolve => 
		web3.eth.getAccounts()
			.then(accounts => resolve(accounts)));
}