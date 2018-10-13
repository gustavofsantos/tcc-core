const ganache = require('ganache-cli');
const Web3 = require('web3');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { pushToIPFS, pullFromIPFS, stopIPFS, waitIpfsReady } = require('./lib_ipfs');
const { normal, success, error, warning } = require('./logger');

const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:7545'));
// const web3 = new Web3(ganache.provider({ gasLimit: 30000000, total_accounts: 50 }));

const mnemonic = "peasant first poem hamster suggest nest decrease stone lonely shed dwarf best";

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

async function createAccount(privateKey) {
  try {
    if (privateKey) {
      // const account = await web3.eth.accounts.privateKeyToAccount(privateKey);
      const account = await web3.eth.personal.newAccount(privateKey);
      return account;
    } else {
      const account = await web3.eth.accounts.create();
      return account;
    }
  } catch (error) {
    console.log(error);
    return error;
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
    return null;
  }
}

async function createUserContract() {
  try {
    const contract = new web3.eth.Contract(JSON.parse(userABI));
    return contract;
  } catch (e) {
    console.log(e);
    return null;
  }
}

/**
 * Deploy the User contract to the blockchain
 * @param {string} userAddress
 * @param {object} userContract
 * @param {object} userAttributes
 */
async function deployUserContract(userAddress, userContract, userAttributes) {
  try {
    const userAttributesCID = await pushToIPFS(userAttributes);
    console.log("userAttributesCID:", userAttributesCID);

    const { name, id, location, publicKey } = userAttributes;

    const deployedContract = userContract
      .deploy({
        data: userBIN,
        arguments: [
          name, id, location, publicKey, userAttributesCID
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
    return null;
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
  getAuthorityAddress,
  getUserAddresses,
  getAccounts,
  unlockAccountWithInternalMnemonic,
  createAccount,
  createAuthorityContract,
  deployAuthorityContract,
  authorityContractAttributes,
  createUserContract,
  deployUserContract,
  waitSystemReady,
  stop
}