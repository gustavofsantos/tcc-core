const assert = require('assert');
const { getUsers, getUser } = require('../src/utils/utils');
const {
  getAuthorityAddress,
  getAccounts,
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


})