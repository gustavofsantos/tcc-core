const assert = require('assert');
const { getUsers, getUser } = require('../src/utils/utils');
const {
  getAuthorityAddress,
  getUserAddresses,
  createAuthorityContract,
  deployAuthorityContract,
  authorityContractAttributes,
  authorityRegisterUser,
  authorityChangeUserPublicKeyWithUserAccount,
  createUserContract,
  deployUserContract,
  getUserPublicKey,
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
          const userContract = await deployUserContract(userAddress, contract, userDefinitions[index], authorityAddress);
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
    it("Shuld call authorityChangeUserPublicKeyWithUserAccount with success", async () => {
      const user = await users[0];
      const newPublicKey = 'brand_new_public_key';

      console.log(user);

      const oldUserPublicKey = await getUserPublicKey(user.contractAddress, authorityAddress);

      const newUserContractAddress = await authorityChangeUserPublicKeyWithUserAccount(
        user.accountAddress,
        user.contractAddress,
        authorityContract,
        authorityAddress,
        newPublicKey
      );

      console.log('newUserContractAddress', newUserContractAddress);

      users[0].contractAddress = newUserContractAddress;

      // get the new public key
      const newUserPublicKey = await getUserPublicKey(newUserContractAddress, authorityAddress);

      console.log('oldUserPublicKey: ', oldUserPublicKey);
      console.log('newUserPublicKey: ', newUserPublicKey);

      assert(oldUserPublicKey !== newUserPublicKey && newUserPublicKey === newPublicKey);
    })
    .timeout(50000);
  });

  it("Should check if Authority is storing the latest version of the contract of the first user", async () => {
    const user = users[0];

  })
  .timeout(50000);

  it("Should change again the first user public key", async () => {
    const user = users[0];
    const newPublicKey = 'another_new_public_key';


  })
  .timeout(50000);
});


function wait(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}