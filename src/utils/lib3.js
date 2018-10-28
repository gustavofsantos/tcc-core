const ganache = require('ganache-cli');
const Web3 = require('web3');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const userLib = require('./lib_user');
const authorityLib = require('./lib_authority');
const { pushToIPFS, pullFromIPFS, stopIPFS, waitIpfsReady } = require('./lib_ipfs');
const { numberAccounts, logFile } = require('../../config');

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
      // console.log(text);
      fs.writeFileSync(logFile, text, 'utf8');
    }
  }
}));

const authorityABI = fs.readFileSync('src/ethereum/build/Authority3.abi');
const authorityBIN = fs.readFileSync('src/ethereum/build/Authority3.bin');
const userABI = fs.readFileSync('src/ethereum/build/User3.abi');
const userBIN = fs.readFileSync('src/ethereum/build/User3.bin');

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
  } catch(e) {
    console.log(e);
  }
}

function stop() {
  stopIPFS();
}

async function createUser(userAddress, userPublicKey, userAttributes) {
  try {
    const userContract = await userLib.createUserContract(web3);
    const deployedContract = await userLib.deployUserContract(web3, userAddress, userContract, userPublicKey, userAttributes);

    return deployedContract;
  } catch (e) {
    return e;
  }
}

async function createAuthority(authorityAddress, authorityAttributes) {
  try {
    const authorityContract = await authorityLib.createAuthorityContract();
    const deployedContract = await authorityLib.deployAuthorityContract(authorityAddress, authorityContract, authorityAttributes);
    
    return deployedContract;
  } catch (e) {
    return e;
  }
}

async function registerUser(userContractAddress, userAddress, authorityContract, authorityAddress) {
  // register user at authority
  try {
    await userLib.userRegisterAuthority(userAddress, userContract, authorityAddress);
    await authorityLib.registerUser(authorityAddress, authorityContract, userContractAddress)
    
    return true;
  } catch (e) {
    return e;
  }
}

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

    return res;
  } catch (e) {
    return e;
  }
}

async function changeUserPublicKey(userAddress, latestUserContract, userPublicKey, authorityAddress) {
  try {
    // create a new user contract
    const newUserContract = await userLib.createUserContract(web3);

    // get user info
    const userAttrCID = await userLib.userGetCID(authorityAddress, latestUserContract);
    const originalContractAddress = await userLib.userGetOriginalContract(authorityAddress, latestUserContract);
    const latestContractAddress = latestUserContract._address;

    const newUserContractDeployed = await userLib.deployUserContract(
      web3,
      userAddress,
      newUserContract,
      userPublicKey,
      userAttrCID,
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

    return res;
  } catch (e) {
    return e;
  }
}


module.exports = {
  createUser,
  createAuthority,
  registerUser,
  changeUserAttributes,
  changeUserPublicKey,
  getAddresses,
  waitSystemReady,
  stop
}
