const ganache = require('ganache-cli');
const Web3 = require('web3');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { pushToIPFS, pullFromIPFS, stopIPFS, waitIpfsReady } = require('./lib_ipfs');
const { normal, success, error, warning } = require('./logger');

const secretKey = 'defaut_secret_key';
const numberAccounts = 51; // 1 authority + 50 users
// connect to ganache
// const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:7545'));

// use internal ganache-core
const web3 = new Web3(ganache.provider({
  gasLimit: 30000000,
  total_accounts: numberAccounts,
  secretKey: secretKey,
  logger: {
    log: text => {
      console.log(text);
    }
  }
}));

const authorityABI = fs.readFileSync('src/ethereum/build/Authority2.abi');
const authorityBIN = fs.readFileSync('src/ethereum/build/Authority2.bin');
const userABI = fs.readFileSync('src/ethereum/build/User2.abi');
const userBIN = fs.readFileSync('src/ethereum/build/User2.bin');

async function getAuthorityAddress() {
  try {
    const accounts = await getAccounts();
    // the first account is the authority account
    return accounts[0];
  } catch (e) {
    return null;
  }
}

/**
 * @param {Number} n
 */
async function getUserAddresses(n) {
  try {
    const accounts = await getAccounts();
    if (n) {
      return accounts.slice(1, n + 1);  
    } else {
      return accounts.slice(1);
    }
  } catch (e) {
    return [];
  }
}

async function createAccount(key) {
  try {
    const privateKey = key ? key : web3.utils.randomHex(32);
    const address = await web3.eth.personal.newAccount(privateKey);

    return {
      privateKey,
      address
    };
  } catch (error) {
    console.log(error);
    return error;
  }
}

async function unlockAccount(address, privateKey) {
  try {
    return await web3.eth.personal.unlockAccount(address, privateKey, 20000);
  } catch (e) {
    console.log(e);
    return e;
  }
}

async function getEthereumAccounts() {
  return await web3.eth.personal.listAccounts;
}

async function unlockAccountWithInternalMnemonic(account) {
  return await web3.eth.personal.unlockAccount(account, mnemonic, 15000);
}

/**
 * @return {list}
 */
async function getAccounts() {
  try {
    const accounts = await web3.eth.getAccounts()
    return accounts;
  } catch (e) {
    return [];
  }
}

/**
 * Create the Authority contract
 */
async function createAuthorityContract() {
  try {
    const contract = new web3.eth.Contract(JSON.parse(authorityABI));
    return contract;
  } catch (e) {
    process.exit(1);
    return null;
  }
}

/**
 * Deploy the authority contract to the blockchain
 * @param {string} authorityAddress
 * @param {object} authorityContract
 * @param {object} authorityAttributes
 */
async function deployAuthorityContract(authorityAddress, authorityContract, authorityAttributes) {
  try {
    const authorityIPFSCID = await pushToIPFS(authorityAttributes);
    const deployedContract = await authorityContract
      .deploy({
        data: authorityBIN,
        arguments: [
          authorityIPFSCID
        ]
      })
      .send({
        from: authorityAddress,
        gas: '3000000'
      })
      .on('receipt', receipt => {
        // console.log('receipt', receipt);
        // console.log('\nAuthority Contract address: ', receipt.contractAddress, '\n');
      });

    return deployedContract;
  } catch (e) {
    console.log(e);
    process.exit(1);
    return null;
  }
}

/**
 * Get authority attributes
 * @param {object} authorityContract
 * @param {string} callerAddress
 */
async function authorityContractAttributes(authorityContract, callerAddress) {
  try {
    const method = await authorityContract
      .methods
      .getAuthorityAttributesCID()

    const attributesCID = await method.call({ from: callerAddress });
    const cost = await method.estimateGas({ from: callerAddress });

    const stringAttributes = await pullFromIPFS(attributesCID);
    const attributes = JSON.parse(stringAttributes);

    return {
      attributes,
      cost
    }
  } catch (e) {
    process.exit(1);
    return null;
  }
}


/**
 * Call the method 'registerUser' in Authority contract
 * @param {string} userContractAddress 
 * @param {object} authorityContract 
 * @param {string} authorityAddress 
 */
async function authorityRegisterUser(userContractAddress, authorityContract, authorityAddress) {
  try {
    if (!userContractAddress)
      throw('User contract address is undefined');
    if(!authorityContract)
      throw('Authority contract object is undefined');
    if(!authorityAddress)
      throw('Authority account address is undefined');
    
    const result = await authorityContract
      .methods
      .registerUser(userContractAddress)
      .call({
        from: authorityAddress
      });

    return result;
  } catch (e) {
    console.log(e);
    return e;
  }
}

/**
 * Protocol to change user public key
 * @param {string} userAddress
 * @param {string} userContractAddress 
 * @param {object} authorityContract 
 * @param {string} authorityAddress 
 * @param {string} newPublicKey 
 */
async function authorityChangeUserPublicKeyWithUserAccount(
  userAddress,
  userContractAddress,
  authorityContract,
  authorityAddress,
  newPublicKey
) {
  try {
    // create a new user contract with the old information
    const newContract  = await createUserContract();

    // get the old contract
    const oldContract = await createUserContract(userContractAddress);

    // get the information of the old user contract
    const oldUserAttributes = await oldContract
      .methods
      .getUserAttributes()
      .call({
        from: authorityAddress
      });

    let originalUserContractAddress = await oldContract
      .methods
      .getOriginalUserContractAddress()
      .call({
        from: authorityAddress
      });

      
    console.log('originalUserContractAddress called: ', originalUserContractAddress);
    
    // get the old contract address if is the original contract
    if (!web3.utils.isAddress(originalUserContractAddress) || 
      originalUserContractAddress === '0x0000000000000000000000000000000000000000'
    ) {
      originalUserContractAddress = oldContract._address;
    }
    console.log('originalUserContractAddress: ', originalUserContractAddress);

    // pull attributes from IPFS
    const stringAttributes = await pullFromIPFS(oldUserAttributes);
    const attributes = JSON.parse(stringAttributes);

    // set the new key
    attributes.publicKey = newPublicKey;
    const contractDeployed = await deployUserContract(
      userAddress,
      newContract,
      attributes,
      authorityAddress,
      originalUserContractAddress
    );

    // disable the old contract and link to the new
    const newContractAddress = contractDeployed._address;
    console.log('newContractAddress', newContractAddress);

    const haveDisabled = await oldContract
      .methods
      .disableAndLinkToNew(newContractAddress)
      .call({
        from: authorityAddress // only the authority can call this method
      });
    
    console.log('haveDisabled: ', haveDisabled);
    
    if (haveDisabled) {
      // authority register the new contract
      const haveChanged = await authorityContract
        .methods
        .changeLatestContract(originalUserContractAddress, newContractAddress)
        .call({
          from: authorityAddress
        });
      
      if (haveChanged) {
        // return address of the new contract
        return newContractAddress;
      } else {
        throw('Cant change user contract to the latest version');
      }

    } else {
      throw("Cant disable the old contract");
    }
  } catch (e) {
    console.log(e);
    process.exit(1);
    return null;
  }
}

async function authorityChangeUserPublicKeyWithoutUserAccount(
  userContractAddress,
  authorityContract,
  authorityAddress,
  newPublicKey
) {
  try {
    
  } catch (e) {
    console.log(e);
    return e;
  }
}

/**
 * Protocol to change user public attributes
 * @param {string} userContractAddress 
 * @param {object} authorityContract 
 * @param {string} authorityAddress 
 * @param {object} newUserAttributes 
 */
async function authorityChangeUserAttributes(userContractAddress, authorityContract, authorityAddress, newUserAttributes) {
  try {
    
  } catch (e) {
    
  }
}

async function createUserContract(contractAddress) {
  try {
    const contract = contractAddress ? 
      new web3.eth.Contract(JSON.parse(userABI), contractAddress) : new web3.eth.Contract(JSON.parse(userABI));
    return contract;
  } catch (e) {
    console.log(e);
    process.exit(1);
    return null;
  }
}

/**
 * Deploy the User contract to the blockchain
 * @param {string} userAddress
 * @param {object} userContract
 * @param {object} userAttributes
 * @param {string} authorityAddress
 * @param {string} originalUserContractAddress
 */
async function deployUserContract(
  userAddress,
  userContract,
  userAttributes,
  authorityAddress,
  originalUserContractAddress,
  secureDevices
) {
  try {
    const userAttributesCID = await pushToIPFS(userAttributes);
    console.log("userAttributesCID:", userAttributesCID);

    const { name, id, location, publicKey } = userAttributes;

    const deployedContract = userContract
      .deploy({
        data: userBIN,
        arguments: [
          name, 
          id,
          location,
          publicKey,
          userAttributesCID,
          authorityAddress,
          originalUserContractAddress || '',
          secureDevices
        ]
      })
      .send({
        from: userAddress,
        gas: '3000000'
      })
      .on('receipt', receipt => {
        // console.log(normal("Deploy user contract"));
        // console.log(normal('===================='));
        // console.log(receipt);
        // console.log();
      });

    return deployedContract;
  } catch (e) {
    console.log(e);
    process.exit(1);
    return null;
  }
}

/**
 * Call the method 'getUserPublicKey'
 * @param {string} contractAddress 
 * @param {string} callerAccountAddress 
 */
async function getUserPublicKey(contractAddress, callerAccountAddress) {
  try {
    const contract = await createUserContract(contractAddress);

    const publicKey = await contract
      .methods
      .getUserPublicKey()
      .call({
        from: callerAccountAddress
      });
    
    return publicKey;
  } catch (e) {
    console.log(e);
    process.exit(1);
    return null;
  }
}

async function getUserContractAttributes(contractAddress, callerAccountAddress) {
  try {
    const contract = await createUserContract(contractAddress);
    const attributesCID = await contract
      .methods
      .getUserAttributes()
      .call({
        from: callerAccountAddress
      });

    const attributesString = await pullFromIPFS(attributesCID);

    return JSON.parse(attributesString);
  } catch (e) {
    
  }
}

async function waitSystemReady() {
  try {
    await waitIpfsReady();
  } catch(e) {
    console.log(e);
  }
}

function stop() {
  stopIPFS();
}

module.exports = {
  // accounts and addresses
  getAuthorityAddress,
  getUserAddresses,
  getAccounts,
  unlockAccountWithInternalMnemonic,
  createAccount,
  unlockAccount,
  // authority
  createAuthorityContract,
  deployAuthorityContract,
  authorityContractAttributes,
  authorityRegisterUser,
  authorityChangeUserPublicKeyWithUserAccount,
  // user
  createUserContract,
  deployUserContract,
  getUserPublicKey,
  getUserContractAttributes,
  // utils
  waitSystemReady,
  stop
}