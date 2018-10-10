const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const fs = require('fs');
const crypto = require('crypto');
const { getUsers, getUser } = require('../src/utils/utils');

// const web3 = new Web3(ganache.provider({ gasLimit: 30000000 }));
const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:7545'));

const authorityABI = fs.readFileSync('src/ethereum/build/Authority.abi');
const authorityBIN = fs.readFileSync('src/ethereum/build/Authority.bin');
const userABI = fs.readFileSync('src/ethereum/build/User.abi');
const userBIN = fs.readFileSync('src/ethereum/build/User.bin');

function create50users() {
  return genUsers(50);
}

const stats = {
  operations: {
    registerUser: [],
    changeUserPublicKey: []
  }
}

describe("Authority Contract Test", () => {
  let authority;
  let authorityAddress;
  let users = [];
  let userAddresses = [];

  before(async () => {
    try {
      const authorityAddr = await getAuthorityAddress();
      const authorityContract = await deployAuthorityContract(authorityAddr);
      authority = authorityContract;
    } catch (e) {
      console.log(e);
    }
  });

  after(() => {
    fs.writeFileSync('stats.json', JSON.stringify(stats));
  });

  describe("Check if authority was deployed", () => {
    it("Should be deployed", () => {
      assert(!!authority);
    });
  });


  describe("Register one user", () => {
    const user = getUser();

    it('Should register one user and get the user contract address', async () => {
      try {
        const { address, cost } = await registerUser(user, authority, authorityAddress);

        stats.operations.registerUser.push(cost);
        userAddresses.push(address);
        users.push(user);

        console.log('---');
        console.log('user address: ', address);
        console.log('cost: ', cost);
        
        assert(!!address);
      } catch (e) {
        console.log(e);
        assert(false);
      }
    });
  });

  describe("Register more 49 users", () => {
    const newUsers = getUsers(49);

    it("Should register more 49 users", async () => {
      try {
        const addresses = await registerUsers(newUsers, authority, authorityAddress);
        for (let pendingAddr of addresses) {
          const { address, cost }  = await pendingAddr;
          console.log('addr: ', address);
          console.log('cost: ', cost);

          stats.operations.registerUser.push(cost);
          userAddresses.push(address);
          users = [...users, newUsers];
        }
        assert(true);
      } catch (e) {
        console.log(e);
        assert(false);
      }
    })
    .timeout(10000);
  });

  describe("Check if users are correct into blockchain", () => {
    it("Should all be the same", async () => {
      try {
        const userName = await getUserName(userAddresses[0]);
        console.log(userName);
        assert(true);
      } catch (e) {
        console.log(e);
        assert(false);
      }
    })
    .timeout(10000);
  })
});


/** ------------------------------------------------------------------- **/

function deployAuthorityContract(fromAddress) {
  return new Promise((resolve, reject) => {
    const authorityContract = new web3.eth.Contract(JSON.parse(authorityABI));

    authorityContract
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
        console.log('\nAuthority Contract address: ', receipt.contractAddress, '\n');
      })
      .then(authority => {
        resolve(authority);
      })
      .catch(err => {
        reject(err);
      })
  })
}

async function createAccountFromPrivateKey(privateKey) {
  const account = await web3.eth.accounts.privateKeyToAccount(privateKey);
  return account;
}

async function registerUser(user, authority, authorityAddress) {
  try {
    const account = await createAccountFromPrivateKey(user.privateKey);
    const method = authority
      .methods
      .registerUser(user.name, user.publicKey);

    
    wait(500);
    const userContractAddress = await method.call({ from: authorityAddress });
    const cost = await method.estimateGas({ from: authorityAddress });

    return {
      address: userContractAddress,
      cost
    }
  } catch (e) {
    return e;
  }
}

async function registerUsers(users, authority, address) {
  const addresses = [];

  try {
    const pendingAddresses = users.map(user =>
      registerUser(user, authority, address));
  
    for (let pending of pendingAddresses) {
      const address = await pending;
      addresses.push(address);
    }

    return addresses;
    return [];
  } catch (e) {
    return e;
  }
}

async function getUserName(userAddress) {
  try {
    const userContract = new web3.eth.Contract(JSON.parse(userABI));
    userContract.options.address = userAddress;
    // console.log('UserContract', UserContract);
    // const userContract = UserContract({
    //   address: userAddress
    // });

    const userName = await userContract
      .methods
      .getName()
      .call();

    return userName;
  } catch (e) {
    return e;
  }
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

function subscribeLog() {
  web3.eth.subscribe('log', )
}

function wait(ms) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}