const { pushToIPFS, pullFromIPFS, stopIPFS, waitIpfsReady } = require('./lib_ipfs');

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
      })
      .send({
        from: authorityAddress,
        gas: '3000000'
      })
      .on('receipt', receipt => {
        console.log('=== Authority Deployment ===');
        console.log(receipt);
        console.log('=== Authority Deployment ===');
      });

    return deployedContract;
  } catch (e) {
    return e;
  }
}

async function registerUser(authorityAddress, authorityDeployedContract, userContractAddress) {
  try {
    await authorityDeployedContract
      .methods
      .registerUser(userContractAddress)
      .call({
        from: authorityAddress
      });

    return true;
  } catch (e) {
    return e;
  }
}

async function changeUserLatestContract(
  authorityAddress,
  authorityDeployedContract,
  userDeployedContract,
  originalUserContract,
  newUserContract
) {
  try {

    await userDeployedContract
      .methods
      .disableAndLinkToNew(newUserContract)
      .call({
        from: authorityAddress
      });

    await authorityDeployedContract
      .methods
      .changeUserLatestContract(originalUserContract, newUserContract)
      .call({
        from: authorityAddress
      });

    return true;
  } catch (e) {
    return e;
  }
}


module.exports = {
  createAuthorityContract,
  deployAuthorityContract,
  registerUser,
  changeUserLatestContract
}