const assert = require('assert');
const { getUsers, getUser } = require('../src/utils/utils');
const {
  getAuthorityAddress,
  getAccounts,
  createAuthorityContract,
  deployAuthorityContract,
  authorityContractAttributes,
  createUserContract,
  deployUserContract
} = require('../src/utils/lib');

describe("TCC-CORE UNIT TEST", () => {
  let authorityAddress;
  let authorityContract;

  before(async () => {
    try {
      authorityAddress = await getAuthorityAddress();
      const authorityAttributes = getUser()

      // deploy authority contract
      const contract = await createAuthorityContract();
      const deployedContract = await deployAuthorityContract(authorityAddress, contract, authorityAttributes);

      // set authority contract
      authorityContract = deployedContract;
    } catch (e) {
      console.log(e);
    }
  });

  describe("Check if authority contract is deployed", () => {
    it("Should authority contract be deployed", () => {
      assert(authorityAddress && authorityContract);
    });
  });

  describe("Get Authority attributes", () => {
    it("Should return a object with the cost of the operation", async () => {
      try {
        const { attributes, cost } = authorityContractAttributes(authorityContract, authorityAddress);

        console.log('---');
        console.log('Attributes: ', attributes);
        console.loh('Operation cost: ', cost);
        console.log('+++');
      } catch (e) {
        console.log(e);
        assert(false);
      }
    });
  });


})