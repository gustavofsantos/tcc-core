const ganache = require('ganache-cli');
const Web3 = require('web3');
const fs = require('fs');
const crypto = require('crypto');
const { pushToIPFS, pullFromIPFS } = require('./lib_ipfs');

const web3 = new Web3(ganache.provider({ gasLimit: 30000000 }));

const authorityABI = fs.readFileSync('../ethereum/build/Authority2.abi');
const authorityBIN = fs.readFileSync('../ethereum/build/Authority2.bin');
const userABI = fs.readFileSync('../ethereum/build/User2.abi');
const userBIN = fs.readFileSync('../ethereum/build/User2.bin');

async function getAuthorityAddress() {
  try {
    const accounts = await getAccounts();
    
    // the first account is the authority account
    return accounts[0];
  } catch (e) {
    return null;
  }
}

async function getUserAddresses() {
  try {
    const [_, ...users] = await getAccounts();
    return users;
  } catch (e) {
    return [];
  }
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
    const authorityIPFSCID = "sdfinsijncsdc";

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
      .on('receipt', () => {
        console.log('\nAuthority Contract address: ', receipt.contractAddress, '\n');
      });
      
    return deployedContract;
  } catch (e) {
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
      result: attributes,
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
    const stringUserAttributes = JSON.stringify(userAttributes);
    const userAttributesCID = await pushToIPFS(stringUserAttributes);

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
    
    return deployedContract
  } catch (e) {
    console.log(e);
    return null;
  }
}

module.exports = {
  getAuthorityAddress,
  getUserAddresses,
  getAccounts,
  createAuthorityContract,
  deployAuthorityContract,
  authorityContractAttributes,
  createUserContract,
  deployUserContract
}