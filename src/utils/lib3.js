const ganache = require('ganache-cli');
const Web3 = require('web3');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const userLib = require('./lib_user');
const authorityLib = require('./lib_authority');
const { pushToIPFS, pullFromIPFS, stopIPFS, waitIpfsReady } = require('./lib_ipfs');
// const { numberAccounts, logFile } = require('../../config');

const numberAccounts = 5*50 + 5;
const logFile = 'out.log';

const privateKey = 'default_private_key';
const publicKey = 'default_public_key';

// connect to ganache
// const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:7545'));

// use internal ganache-core
const web3 = new Web3(ganache.provider({
  gasLimit: 30000000,
  total_accounts: numberAccounts + 1,
  secretKey: privateKey,
  logger: {
    log: text => {
      console.log(text);
      // fs.writeFileSync(logFile, text, 'utf8');
    }
  }
}));



web3.eth.subscribe('logs', {}, (error, result) => {
  if (error) {
    console.log(error);
  } else {
    console.log(result);
  }
})

async function getAddresses() {
  try {
    const addresses = await web3.eth.getAccounts();
    return addresses;
  } catch (e) {
    return e;
  }
}

async function waitSystemReady() {
  try {
    await waitIpfsReady();
    return;
  } catch(e) {
    return e;
  }
}

function stop() {
  stopIPFS();
}

/**
 * 
 * @param {string} userAddress
 * @param {string} userPublicKey
 * @param {object} userAttributes
 */
async function createUser(userAddress, userPublicKey, userAttributes) {
  try {
    const userContract = await userLib.createUserContract(web3);
    const deployedContract = await userLib.deployUserContract(web3, userAddress, userContract, userPublicKey, userAttributes);

    return deployedContract;
  } catch (e) {
    return e;
  }
}

/**
 * 
 * @param {string} authorityAddress
 * @param {object} authorityAttributes
 */
async function createAuthority(authorityAddress, authorityAttributes) {
  try {
    const authorityContract = await authorityLib.createAuthorityContract(web3);
    const deployedContract = await authorityLib.deployAuthorityContract(authorityAddress, authorityContract, authorityAttributes);

    return deployedContract;
  } catch (e) {
    console.log(e);
    return null;
  }
}

/**
 * 
 * @param {object} userContract 
 * @param {string} userAddress 
 * @param {object} authorityContract 
 * @param {string} authorityAddress
 * @returns {boolean}
 */
async function registerUser(userContract, userAddress, authorityContract, authorityAddress) {
  console.log('--- registerUser ---');
  console.log('userAddress: ', userAddress);
  console.log('authorityAddress', authorityAddress);
  console.log();

  // register user at authority
  try {
    const userContractAddress = userContract._address;
    const resUser = await userLib.userRegisterAuthority(userAddress, userContract, authorityAddress);
    const resAuthority = await authorityLib.registerUser(authorityAddress, authorityContract, userContractAddress);
    return resUser && resAuthority;
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
}

async function userSignData(userAddress, userContract, userPrivateKey, data) {

  try {
    const res = await userLib.userSignData(userAddress, userContract, userPrivateKey, data);
    return res;
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
}

/**
 * 
 * @param {string} userAddress 
 * @param {object} latestUserContract 
 * @param {object} userAttributes 
 * @param {string} authorityAddress 
 * @param {object} authorityContract 
 */
async function changeUserAttributes(userAddress, latestUserContract, userAttributes, authorityAddress, authorityContract) {
  try {
    // create a new user contract
    const newUserContract = await userLib.createUserContract(web3);

    // get user info
    const userPublicKey = await userLib.userGetPublicKey(authorityAddress, latestUserContract);
    const originalContractAddress = await userLib.userGetOriginalContract(authorityAddress, latestUserContract);
    const latestContractAddress = await latestUserContract._address;

    const newUserContractDeployed = await userLib.deployUserContract(
      web3,
      userAddress,
      newUserContract,
      userPublicKey,
      userAttributes,
      originalContractAddress,
      latestContractAddress
    );

    const res = await authorityLib.changeUserLatestContract(
      authorityAddress,
      authorityContract,
      latestUserContract,
      originalContractAddress,
      newUserContractDeployed._address
    );

    return newUserContractDeployed;
  } catch (e) {
    console.log(e);
    return null;
  }
}

/**
 * 
 * @param {string} userAddress 
 * @param {object} latestUserContract 
 * @param {string} userPublicKey 
 * @param {string} authorityAddress
 * @param {object} authorityContract
 * @returns {object}
 */
async function changeUserPublicKey(userAddress, latestUserContract, userPublicKey, authorityAddress, authorityContract) {

  try {
    // create a new user contract
    const newUserContract = await userLib.createUserContract(web3);

    // get user info
    const userAttrCID = await userLib.userGetCID(authorityAddress, latestUserContract);
    const userAttributesString = await pullFromIPFS(userAttrCID);
    const userAttributes = JSON.parse(userAttributesString);

    const originalContractAddress = await userLib.userGetOriginalContract(authorityAddress, latestUserContract);
    const latestContractAddress = latestUserContract._address;

    const newUserContractDeployed = await userLib.deployUserContract(
      web3,
      userAddress,
      newUserContract,
      userPublicKey,
      userAttributes,
      originalContractAddress,
      latestContractAddress
    );

    const res = await authorityLib.changeUserLatestContract(
      authorityAddress,
      authorityContract,
      latestUserContract,
      originalContractAddress,
      newUserContractDeployed._address
    );

    return {
      status: res,
      contract: newUserContractDeployed
    }
  } catch (e) {
    console.log(e);
    return null;
  }
}

/**
 * Check if an address is a valid Ethereum address
 * @param {string} address Ethereum address
 */
function isAddressValid(address) {
  return web3.utils.isAddress(address);
}


module.exports = {
  createUser,
  createAuthority,
  registerUser,
  userSignData,
  changeUserAttributes,
  changeUserPublicKey,
  getAddresses,
  waitSystemReady,
  stop,
  isAddressValid
}
