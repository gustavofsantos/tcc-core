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
  stop
} = require('../src/utils/lib');
const { normal, success, error } = require('../src/utils/logger');

describe("TCC-CORE UNIT TEST", () => {
  let authorityAddress;
  let authorityContract;

  before(async (done) => {
    this.timeout(10000);
    try {
      authorityAddress = await getAuthorityAddress();
      const authorityAttributes = getUser();

      // deploy authority contract
      const contract = await createAuthorityContract();
      const deployedContract = await deployAuthorityContract(authorityAddress, contract, authorityAttributes);

      // set authority contract
      authorityContract = deployedContract;
      done();
    } catch (e) {
      console.log(e);
      done();
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
        const { attributes, cost } = authorityContractAttributes(authorityContract, authorityAddress);

        console.log('---');
        console.log('Attributes: ', attributes);
        console.log('Operation cost: ', cost);
        console.log('+++');

        assert(attributes && cost);
      } catch (e) {
        console.log(e);
        assert(false);
      }
    })
    .setMaxListeners(32)
    .timeout(10000);
  });


})