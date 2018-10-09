const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const fs = require('fs');
const crypto = require('crypto');
const { getUsers, getUser } = require('../src/utils/utils');

const web3 = new Web3(ganache.provider({ gasLimit: 30000000 }));

// const userContractCompiled = require('../src/ethereum/build/User.json');
// const authorityContractCompiled = require('../src/ethereum/build/Authority.json');

const authorityABI = fs.readFileSync('src/ethereum/build/Authority.abi');
const authorityBIN = fs.readFileSync('src/ethereum/build/Authority.bin');

function create50users() {
  return genUsers(50);
}

describe("Authority Contract Test", () => {
  let authority;
  let authorityAddress;
  describe("Deploy one authority contract", () => {
    it("Should authority be deployed at blockchain", done => {
      getAuthorityAddress()
      .then(authorityAddr => {
        authorityAddress = authorityAddr;

        deployAuthorityContract(authorityAddr)
        .then(authorityContract => {
          authority = authorityContract

          assert(!!authorityContract);
        })
        .catch(err => {
          assert(false);
        })
        .finally(done);
      });
    });
  });

  describe("Register one user", () => {
    const user = getUser();
    it('Should register one user and get the user contract address', done => {
      registerUser(user, authority, authorityAddress)
      .then(userContractAddress => {
        console.log('user address: ', userContractAddress);
        assert(!!userContractAddress);
      })
      .catch(err => {
        assert(false);
      })
      .finally(done);
    });
  });

  describe("Register more 49 users", () => {
    const users = getUsers(49);
    console.log('users', users);
    it("Should register more 49 users", done => {
      registerUsers(users, authority, authorityAddress)
      .then(futureUserContractAddresses => {
        Promise.all(futureUserContractAddresses)
        .then(userContractAddresses => {
          console.log(userContractAddresses);
          assert.ok(!!userContractAddresses);
        })
        .catch(err => {
          console.log(err);
          assert.ok(false);
        })
        .finally(done);
      })
      .catch(err => {
        console.log(err);
        assert.ok(false);
      })
      .finally(done);
    });
  });
});

// function test() {
//   console.log('\tAuthority Contract Test');
//   console.log('\t=======================');

//   console.log('\t\tDeploy Authority Contract');
//   authorityAddress().then(authorityAddr => {
//     deployAuthorityContract(authorityAddr).then(authority => {
//       if (authority) {
//         registerUsers(authority, authorityAddr, create50users()).then(futureAddresses => {
//           if (futureAddresses.length === users.length) {
//             console.log(futureAddresses);
            
//             // select addresses[0] to change user public key
//             futureAddresses[0].then(userAddress => {
//               changeUserKey(authority, authorityAddr, userAddress, "nova chave publica")
//                 .then(newUserAddress => {
//                   console.log(`${userAddress} -> ${newUserAddress}`)
//                 })
//                 .catch(err => {
//                   console.log('Error chaging user public key: ', err);
//                 });
//             })
//             .catch(err => {
//               console.log('Error getting user contract address')
//             });
//           }
//         })
//         .catch(err => {
//           console.log('Error registering users');
//         })
//       } else {
//         console.log('\t\t\tFAIL');
//       }
//     }).catch(err => {
//       console.log('Error deploying Authority contract.');
//     });
//   }).catch(err => {
//     console.log('Error getting authority address');
//   })
// }

// test();


/** ------------------------------------------------------------------- **/

function deployAuthorityContract(fromAddress) {
  return new Promise((resolve, reject) => {
    const contract = new web3.eth.Contract(JSON.parse(authorityABI));

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
      })
      .then(authority => {
        resolve(authority);
      })
      .catch(err => {
        reject(err);
      })
  })
}

function registerUser(user, authority, authorityAddress) {
  return new Promise((resolve, reject) => {
    const futureUserContractAddress = authority
      .methods
      .registerUser(user.name, user.publicKey)
      .call({
        from: authorityAddress
      });

    futureUserContractAddress
    .then(address => {
      resolve(address);
    })
    .catch(err => {
      eject('Cannot register user:', user, err);
    });
  });
}

function registerUsers(
  , authority, address) {
  return new Promise((resolve, reject) => {
    const futureAddresses = users.map(user =>
      registerUser(user, authority, address));

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

function getAuthorityAddress() {
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