const assert = require('assert');
const { getUsers, getUser } = require('../src/utils/utils');
const { normal, success, error } = require('../src/utils/logger');
const config = require('../../config');
const {
  createUser,
  createAuthority,
  registerUser,
  changeUserAttributes,
  changeUserPublicKey,
  getAddresses,
  waitSystemReady,
  stop
} = require('../src/utils/lib3');


describe("TCC-CORE UNIT TEST", () => {

  let authorityAddresses = [];
  let userAddresses = [];

  let authorities = [];

  before(async () => {
    console.log(success(`Deploy ${config.numberAuthorities} Authorities`));

    try {
      const addresses = await getAddresses();

      authorityAddresses = addresses.slice(0, config.numberAuthorities);
      userAddresses = addresses.slice(config.numberAuthorities);

      await waitSystemReady();

      // create authorities
      const authorities = await authorityAddresses.map(async address => await createAuthority(address, getUser()));

      await Promise.all(authorities);
    } catch (e) {
      console.log(e);
    }
  });

  after(() => {
    console.log(normal('Finishing tests...'));
    stop();
  });

  describe("Check if authorities are deployed", () => {
    it("Should authority contracts be deployed", async () => {
      if (authorities) {
        const authoritiesDeployed = authorities.filter(authority => Object.keys(authority).length > 0);
        assert(authoritiesDeployed.length === config.numberAuthorities);
      } else {
        assert(false);
      }
      assert(authorityAddress && authorityContract);
    })
    .setMaxListeners(32)
    .timeout(10000);
  });
})