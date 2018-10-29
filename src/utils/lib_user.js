const fs = require('fs');

const { pushToIPFS, pullFromIPFS, stopIPFS, waitIpfsReady } = require('./lib_ipfs');

const userABI = fs.readFileSync('src/ethereum/build/User3.abi');
const userBIN = fs.readFileSync('src/ethereum/build/User3.bin');

/**
 * Create the User contract
 */
async function createUserContract(web3, contractAddress) {
  try {
    const contract = contractAddress ? 
      new web3.eth.Contract(JSON.parse(userABI), contractAddress) : new web3.eth.Contract(JSON.parse(userABI));
    return contract;
  } catch (e) {
    return e;
  }
}

/**
 * 
 * @param {object} web3 
 * @param {string} userAddress 
 * @param {object} userContract 
 * @param {string} userPublicKey 
 * @param {object} userAttributes 
 * @param {string} userOriginalContractAddress 
 * @param {string} userLatestContractAddress 
 */
async function deployUserContract(
  web3,
  userAddress,
  userContract,
  userPublicKey,
  userAttributes,
  userOriginalContractAddress,
  userLatestContractAddress)
{
  try {
    const userIPFSCID = await pushToIPFS(userAttributes);

    const userDeployedContract = await userContract
      .deploy({
        data: userBIN,
        arguments: [
          userIPFSCID,
          userPublicKey,
          web3.utils.isAddress(userOriginalContractAddress) ? userOriginalContractAddress : '0x0000000000000000000000000000000000000000',
          web3.utils.isAddress(userLatestContractAddress) ? userLatestContractAddress : '0x0000000000000000000000000000000000000000'
        ]
      })
      .send({
        from: userAddress,
        gas: '3000000'
      })
      .on('receipt', receipt => {
        console.log('=== User: deploy ===');
        console.log('gasUsed: ', receipt.gasUsed);
        console.log();
      });

    // console.log(userDeployedContract)
    return userDeployedContract;
  } catch (e) {
    console.log(e);
    process.exit(1);
    return e;
  }
}

async function userRegisterAuthority(userAddress, userDeployedContract, authorityAddress) {

  try {
    const method = userDeployedContract.methods.registerToAuthority(authorityAddress);
    const result = await method.call({ from: userAddress });
    const estimateGas = await method.estimateGas({ from : userAddress });
    
    console.log('=== User: registerToAuthority ===');
    console.log('estimateGas: ', estimateGas);
    console.log();

    return result;
  } catch (e) {
    console.log(e);
    process.exit(1);
    return e;
  }
}

/**
 * 
 * @param {string} callerAddress 
 * @param {object} userDeployedContract 
 * @param {string} authorityAddress 
 */
async function userIsRegisteredByAuthority(callerAddress, userDeployedContract, authorityAddress) {
  console.log('--- userIsRegisteredByAuthority ---');
  console.log('callerAddress: ', callerAddress);
  console.log('authorityAddress: ', authorityAddress);
  console.log();
  try {
    const method = userDeployedContract.methods.isRegisteredByAuthority(authorityAddress);
    const result = await method.call({ from: callerAddress });

    const estimateGas = await method.estimateGas({ from : callerAddress });

    console.log('=== User: isRegisteredByAuthority ===');
    console.log('estimateGas: ', estimateGas);
    console.log();

    return result;
  } catch (e) {
    console.log(e);
    process.exit(1);
    return e;
  }
}

async function userRegisterSecureDevice(userAddress, userDeployedContract, secureDevicePublicKey) {
  try {
    const method = userDeployedContract.methods.setSecureDevicePublicKey(secureDevicePublicKey);
    const result = await method.call({ from: userAddress });

    const estimateGas = await method.estimateGas({ from : userAddress });

    console.log('=== User: setSecureDevicePublicKey ===');
    console.log('estimateGas: ', estimateGas);
    console.log()

    return true;
  } catch (e) {
    console.log(e);
    process.exit(1);
    return e;
  }
}

async function userDisableSecureDevice(userAddress, userDeployedContract, secureDevicePublicKey) {
  try {
    const method = userDeployedContract.methods.disableSecureDevice(secureDevicePublicKey);
    const result = await method.call({ from: userAddress });

    const estimateGas = await method.estimateGas({ from : userAddress });

    console.log('=== User: disableSecureDevice ===');
    console.log('estimateGas: ', estimateGas);
    console.log();

    return true;
  } catch (e) {
    console.log(e);
    process.exit(1);
    return e;
  }
}

async function userSignData(userAddress, userDeployedContract, userPrivateKey, data) {
  try {
    const sign = crypto.createSign('SHA256');
    sign.write(data);
    sign.end();
    const signed = sign.sign(userPrivateKey, 'hex');

    const ipfsCID = await pushToIPFS({
      signedData: signed,
      author: userAddress
    });

    const method = userDeployedContract.methods.signData(ipfsCID);
    const result = await method.call({ from: userAddress });

    const estimateGas = await method.estimateGas({ from : userAddress });

    console.log('=== User: signData ===');
    console.log('estimateGas: ', estimateGas);
    console.log();

    return result;
  } catch (e) {
    console.log(e);
    process.exit(1);
    return e;
  }
}

async function userIsDataSigned(callerAddress, userDeployedContract, dataSignedCID) {
  try {

    const method = userDeployedContract.methods.isSigned(dataSignedCID);
    const result = await method.call({ from: callerAddress });
    
    const estimateGas = await method.estimateGas({ from : callerAddress });

    console.log('=== User: isSigned ===');
    console.log('estimateGas: ', estimateGas);
    console.log();

    return result;
  } catch (e) {
    console.log(e);
    process.exit(1);
    return e;
  }
}

async function userGetPublicKey(callerAddress, userDeployedContract) {
  try {
    const method =  userDeployedContract.methods.getPublicKey();
    const result = await method.call({ from: callerAddress });

    const estimateGas = await method.estimateGas({ from : callerAddress });

    console.log('=== User: getPublicKey ===');
    console.log('estimateGas: ', estimateGas);
    console.log();

    return result;
  } catch (e) {
    console.log(e);
    process.exit(1);
    return e;
  }
}

async function userGetCID(callerAddress, userDeployedContract) {
  try {

    const method = userDeployedContract.methods.getCID();
    const result = await method.call({ from: callerAddress });

    const estimateGas = await method.estimateGas({ from : callerAddress });

    console.log('=== User: getCID ===');
    console.log('estimateGas: ', estimateGas);
    console.log();

    return result;
  } catch (e) {
    console.log(e);
    process.exit(1);
    return e;
  }
}

async function userGetLastContract(callerAddress, userDeployedContract) {
  try {

    const method = userDeployedContract.methods.getLastContract();
    const result = await method.call({ from: callerAddress });

    const estimateGas = await method.estimateGas({ from : callerAddress });

    console.log('=== User: getLastContract ===');
    console.log('estimateGas: ', estimateGas);
    console.log();

    return result;
  } catch (e) {
    console.log(e);
    process.exit(1);
    return e;
  }
}

async function userGetNextContract(callerAddress, userDeployedContract) {
  try {

    const method = userDeployedContract.methods.getNextContract();
    const result = await method.call({ from: callerAddress });

    const estimateGas = await method.estimateGas({ from : callerAddress });

    console.log('=== User: getNextContract ===');
    console.log('estimateGas: ', estimateGas);
    console.log();

    return result;
  } catch (e) {
    console.log(e);
    process.exit(1);
    return e;
  }
}

async function userGetOriginalContract(callerAddress, userDeployedContract) {
  try {

    const method = userDeployedContract.methods.getOriginalContract();
    const result = await method.call({ from: callerAddress });

    const estimateGas = await method.estimateGas({ from : callerAddress });

    console.log('=== User: getOriginalContract ===');
    console.log('estimateGas: ', estimateGas);
    console.log();

    return result;

  } catch (e) {
    console.log(e);
    process.exit(1);
    return e;
  }
}

async function userGetOwner(callerAddress, userDeployedContract) {
  try {

    const method = userDeployedContract.methods.getOwner();
    const result = await method.call({ from: callerAddress });

    const estimateGas = await method.estimateGas({ from : callerAddress });

    console.log('=== User: getOwner ===');
    console.log('estimateGas: ', estimateGas);
    console.log();

    return result;

  } catch (e) {
    console.log(e);
    process.exit(1);
    return e;
  }
}


module.exports = {
  createUserContract,
  deployUserContract,
  userRegisterAuthority,
  userIsRegisteredByAuthority,
  userRegisterSecureDevice,
  userDisableSecureDevice,
  userSignData,
  userIsDataSigned,
  userGetPublicKey,
  userGetCID,
  userGetLastContract,
  userGetNextContract,
  userGetOriginalContract,
  userGetOwner
};