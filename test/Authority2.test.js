const assert = require('assert');
const { getUsers, getUser } = require('../src/utils/utils');
const {
  getAuthorityAddress,
  getUserAddresses,
  createAccount,
  unlockAccountWithInternalMnemonic,
  createAuthorityContract,
  deployAuthorityContract,
  authorityContractAttributes,
  createUserContract,
  deployUserContract,
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

  describe("Create 50 users", () => {
    let userAddresses;
    let userObjects;

    it("Should create 50 different users", () => {
      userObjects = getUsers(50);
      assert(userObjects.length === 50);
    });

    it("Should get 50 user addresses", async () => {
      const addresses = await getUserAddresses(50);
      console.log('length: ', addresses.length);
      userAddresses = addresses;
      assert(userAddresses.length === 50);
    });

    it("Should unlock all accounts", async () => {
      for (account of userAddresses) {
        await unlockAccountWithInternalMnemonic(account);
      }
    });

    it("Should deploy 50 user contracts", async () => {
      const userContract = await createUserContract();

      const usersDeployed = await userAddresses.map(async (address, index) => {
        const userObject = userObjects[index];
        const deployedContract = await deployUserContract(address, userContract, userObject);
        return ({
          address,
          object: userObject,
          contract: deployedContract
        });
      });

      
      await Promise.all(usersDeployed);
      console.log(usersDeployed);

      for (let userDeployed of usersDeployed) {

        console.log('userDeployed.address? ', !!userDeployed.address);
        console.log('userDeployed.object? ', !!userDeployed.object);
        console.log('userDeployed.contract? ', !!userDeployed.contract);


        if (!!userDeployed.address && Object.keys(userDeployed.object).length > 0 && !!userDeployed.contract) {
          console.log('will push');
          users.push(userDeployed);
        } else {
          console.log('not pushed');
          throw('Error')
        }
      }

      assert(users.length === 50);
    })
    .timeout(30000);
  });
});


function wait(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}