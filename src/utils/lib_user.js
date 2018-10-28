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

async function deployUserContract(
  web3,
  userAddress,
  userContract,
  userPublicKey,
  userAttributes,
  userOriginalContractAddress,
  userLatestContractAddress) {
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
        // console.log('=== User Deployment ===');
        // console.log(receipt);
        // console.log('=== User Deployment ===');
        // console.log();
      });

    // console.log(userDeployedContract)
    return userDeployedContract;
  } catch (e) {
    return e;
  }
}

async function userRegisterAuthority(userAddress, userDeployedContract, authorityAddress) {
  try {
    await userDeployedContract
      .methods
      .registerToAuthority(authorityAddress)
      .call({
        from: userAddress
      })
  } catch (e) {
    return e;
  }
}

async function userIsRegisteredByAuthority(callerAddress, userDeployedContract, authorityAddress) {
  try {
    const result = await userDeployedContract
      .methods
      .isRegisteredByAuthority(authorityAddress)
      .call({
        from: callerAddress
      });

    return result;
  } catch (e) {
    return e;
  }
}

async function userRegisterSecureDevice(userAddress, userDeployedContract, secureDevicePublicKey) {
  try {
    await userDeployedContract
      .methods
      .setSecureDevicePublicKey(secureDevicePublicKey)
      .call({
        from: userAddress
      });

    return true;
  } catch (e) {
    return e;
  }
}

async function userDisableSecureDevice(userAddress, userDeployedContract, secureDevicePublicKey) {
  try {
    await userDeployedContract
      .methods
      .disableSecureDevice(secureDevicePublicKey)
      .call({
        from: userAddress
      });

    return true;
  } catch (e) {
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

    const couldStore = await userDeployedContract
      .methods
      .signData(ipfsCID)
      .call({
        from: userAddress
      });

    return couldStore;
  } catch (e) {
    return e;
  }
}

async function userIsDataSigned(callerAddress, userDeployedContract, dataSignedCID) {
  try {
    const result = await userDeployedContract
      .methods
      .isSigned(dataSignedCID)
      .call({
        from: callerAddress
      });

    return result;
  } catch (e) {
    return e;
  }
}

async function userGetPublicKey(callerAddress, userDeployedContract) {
  try {
    const publicKey = await userDeployedContract
      .methods
      .getPublicKey()
      .call({
        from: callerAddress
      });

    return publicKey;
  } catch (e) {
    return e;
  }
}

async function userGetCID(callerAddress, userDeployedContract) {
  try {
    const cid = await userDeployedContract
      .methods
      .getCID()
      .call({
        from: callerAddress
      });

    return cid;
  } catch (e) {
    return e;
  }
}

async function userGetLastContract(callerAddress, userDeployedContract) {
  try {
    const lastContract = await userDeployedContract
      .methods
      .getLastContract()
      .call({
        from: callerAddress
      });

    return lastContract;
  } catch (e) {
    return e;
  }
}

async function userGetNextContract(callerAddress, userDeployedContract) {
  try {
    const nextContract = await userDeployedContract
      .methods
      .getNextContract()
      .call({
        from: callerAddress
      });

    return nextContract;
  } catch (e) {
    return e;
  }
}

async function userGetOriginalContract(callerAddress, userDeployedContract) {
  try {
    const originalContract = await userDeployedContract
      .methods
      .getOriginalContract()
      .call({
        from: callerAddress
      });

    return originalContract;
  } catch (e) {
    return e;
  }
}

async function userGetOwner(callerAddress, userDeployedContract) {
  try {
    const ownerAddress = await userDeployedContract
      .methods
      .getOwner()
      .call({
        from: callerAddress
      });

    return ownerAddress;
  } catch (e) {
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