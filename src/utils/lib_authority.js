const fs = require('fs');

const { pushToIPFS, pullFromIPFS, stopIPFS, waitIpfsReady } = require('./lib_ipfs');

const authorityABI = fs.readFileSync('src/ethereum/build/Authority3.abi');
const authorityBIN = fs.readFileSync('src/ethereum/build/Authority3.bin');

/**
 * Create the Authority contract
 */
async function createAuthorityContract(web3) {
  try {
    const contract = new web3.eth.Contract(JSON.parse(authorityABI));
    return contract;
  } catch (e) {
    console.log(e);
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
      })
      .send({
        from: authorityAddress,
        gas: '3000000'
      })
      .on('receipt', receipt => {
        console.log('=== Authority: deploy ===');
        console.log('gasUsed: ', receipt.gasUsed);
        console.log();
      });

    return deployedContract;
  } catch (e) {
    console.log(e);
    process.exit(1);
    return null;
  }
}

async function registerUser(authorityAddress, authorityDeployedContract, userContractAddress) {
  try {

    const method = authorityDeployedContract.methods.registerUser(userContractAddress);
    const result = await method.call({ from: authorityAddress });

    const estimateGas = await method.estimateGas({ from : authorityAddress });

    console.log('=== Authority: registerUser ===');
    console.log('estimateGas: ', estimateGas);

    return result;
  } catch (e) {
    console.log(e);
    process.exit(0);
    return null;
  }
}

/**
 * 
 * @param {string} authorityAddress 
 * @param {object} authorityDeployedContract 
 * @param {object} userDeployedContract 
 * @param {string} originalUserContractAddress 
 * @param {string} newUserContractAddress 
 */
async function changeUserLatestContract(
  authorityAddress,
  authorityDeployedContract,
  userDeployedContract,
  originalUserContractAddress,
  newUserContractAddress
) {
  try {

    const method1 = userDeployedContract.methods.disableAndLinkToNew(newUserContractAddress);
    const result1 = await method1.call({ from: authorityAddress });

    const method2 = authorityDeployedContract.methods.changeUserLatestContract(originalUserContractAddress, newUserContractAddress);
    const result2 = await method2.call({ from: authorityAddress });

    const estimateGas1 = await method1.estimateGas({ from: authorityAddress });
    const estimateGas2 = await method2.estimateGas({ from: authorityAddress });

    console.log('=== Authority: disableAndLinkToNew (User) ===');
    console.log('estimateGas: ', estimateGas1);

    console.log('=== Authority: changeUserLatestContract ===');
    console.log('estimateGas: ', estimateGas2);

    console.log('result1: ', result1);
    console.log('result2: ', result2);

    return result1 && result2;
  } catch (e) {
    console.log(e);
    process.exit(1);
    return null;
  }
}

async function getOwner(caller, authorityContract) {
  try {
    const method = authorityContract.methods.getOwner();
    const result = await method.call({ from: caller });

    const estimateGas = await method.estimateGas({ from: caller });

    console.log('=== Authority: getOwner ===');
    console.log('estimateGas: ', estimateGas);

    return result;
  } catch (error) {
    console.log(e);
    process.exit(1);
  }
}

module.exports = {
  createAuthorityContract,
  deployAuthorityContract,
  registerUser,
  changeUserLatestContract,
  getOwner
}