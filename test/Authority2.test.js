const assert = require('assert');
const { getUsers, getUser } = require('../src/utils/utils');
const {
  getAuthorityAddress,
  getUserAddresses,
  createAccount,
  unlockAccount,
  unlockAccountWithInternalMnemonic,
  createAuthorityContract,
  deployAuthorityContract,
  authorityContractAttributes,
  authorityRegisterUser,
  authorityChangeUserPublicKey,
  authorityChangeUserAttributes,
  createUserContract,
  deployUserContract,
  getUserContractAttributes,
  waitSystemReady,
  stop
} = require('../src/utils/lib');
const { normal, success, error } = require('../src/utils/logger');

describe("TCC-CORE UNIT TEST", () => {
  let authorityAddress;
  let authorityContract;
  let users = [];

  before(async () => {
    console.log(normal('Running before all hook...'));
    try {
      await waitSystemReady();

      authorityAddress = await getAuthorityAddress();
      const authorityAttributes = getUser();

      // deploy authority contract
      const contract = await createAuthorityContract();
      const deployedContract = await deployAuthorityContract(authorityAddress, contract, authorityAttributes);

      // set authority contract
      authorityContract = deployedContract;
      console.log(success('Authority contract created and deployed.'));
    } catch (e) {
      console.log(error('Error creating or deploying the Authority contract.'));
      console.log(e);
    }
  });

  after(() => {
    console.log(normal('Finishing tests...'));
    stop();
  })

  describe("Check if authority contract is deployed", () => {
    it("Should authority contract be deployed", () => {
      assert(authorityAddress && authorityContract);
    })
    .setMaxListeners(32)
    .timeout(10000);
  });

  describe("Get Authority attributes", () => {
    it("Should return a object with the cost of the operation", async () => {
      try {
        const { attributes, cost } = await authorityContractAttributes(authorityContract, authorityAddress);

        assert(Object.keys(attributes).length > 0  && cost);
      } catch (e) {
        console.log(e);
        assert(false);
      }
    })
    .setMaxListeners(32)
    .timeout(10000);
  });

  // describe("Create one user account", () => {
  //   it("Should create a Ethereum account", async () => {
  //     const user = getUser();
  //     const userAccount = await createAccount(user.privateKey);

  //     console.log(' => ', userAccount);

  //     // should have an address
  //     assert(!!userAccount);
  //   })
  //   .timeout(10000);
  // });

  describe("Create 50 users using 50 accounts previously created", () => {
    let userDefinitions;

    it("Should create 50 users definitions", () => {
      userDefinitions = getUsers(50);
      assert(userDefinitions.length === 50);
    });

    it("Should deploy 50 user contracts", async () => {
      try {
        // get the addresses
        const addresses = await getUserAddresses(50);

        // create user contract
        const contract = await createUserContract();

        const deployedContracts = addresses.map(async (userAddress, index) => {
          const userContract = await deployUserContract(userAddress, contract, userDefinitions[index]);
          return userContract;
        });

        await Promise.all(deployedContracts);

        users = deployedContracts.map(async (deployedUserContract, index) => {
          const contract = await deployedUserContract;
          const definition = userDefinitions[index];

          const isRegistered = await authorityRegisterUser(contract._address, authorityContract, authorityAddress);

          console.log('isRegistered? ', isRegistered);

          return {
            accountAddress: addresses[index],
            contractAddress: contract._address, 
            contract,
            definition
          }
        });

        await Promise.all(users);

        // pick the first user
        const user = await users[0];
    
        const contractAttributes = await getUserContractAttributes(user.contractAddress, user.accountAddress);
  
        assert(JSON.stringify(contractAttributes) === JSON.stringify(user.definition));
      } catch (e) {
        console.log(e);
        assert(false);        
      }
    })
    .timeout(50000);
  });

  describe("Change first user public key", () => {
    
  });
});


function wait(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}