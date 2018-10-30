const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const fs = require('fs');
const libUser = require('../src/utils/lib_user');
const libAuthority = require('../src/utils/lib_authority');
const libIPFS = require('../src/utils/lib_ipfs');
const { getUser } = require('../src/utils/utils');

const accountDefaultPrivateKey = "private-key";
const numberUsers = 50;

// use internal ganache-core
const web3 = new Web3(ganache.provider({
  gasLimit: 30000000,
  total_accounts: numberUsers + 1,
  secretKey: accountDefaultPrivateKey,
  logger: {
    log: text => {
      console.log(text);
    }
  }
}));

const defaultPublicKey = fs.readFileSync(__dirname + '/keys/default.pub', 'utf8');
const defaultPrivateKey = fs.readFileSync(__dirname + '/keys/default', 'utf8');
const newPublicKey = fs.readFileSync(__dirname + '/keys/new.pub', 'utf8');
const newPrivateKey = fs.readFileSync(__dirname + '/keys/new', 'utf8');

describe("CONTRACTS UNIT COST TEST", function() {
  const user = {
    address: null,
    contract: null
  };
  const authority = {
    address: null,
    contract: null
  };

  this.timeout(50000);

  before(async function() {
    await libIPFS.waitIpfsReady();

    const accounts = await web3.eth.getAccounts();

    authority.address = accounts[0];
    user.address = accounts[1];
  });

  after(async function() {
    await libIPFS.stopIPFS();
  });

  describe("Create and Deploy Authority Contract", function() {
    let genericContract;

    it("Should create Authority Contract", async function() {
      try {
        genericContract = await libAuthority.createAuthorityContract(web3);
        assert(genericContract);
      } catch (e) {
        console.log(e);
        process.exit(1);
      }
    });

    it("Should deploy Authority Contract", async function() {
      try {
        authority.contract = await libAuthority.deployAuthorityContract(authority.address, genericContract, getUser());
        assert(authority.contract);
      } catch (e) {
        console.log(e);
        process.exit(1);
      }
    });
  });

  describe("Create and Deploy User Contract", function() {
    let genericContract;

    it("Should create User Contract", async function() {
      try {
        genericContract = await libUser.createUserContract(web3);
        assert(genericContract);
      } catch (e) {
        console.log(e);
        process.exit(1);
      }
    });

    it("SHould deploy User Contract", async function() {
      try {
        user.contract = await libUser.deployUserContract(web3, user.address, genericContract, defaultPublicKey, getUser(), "", "");

        assert(user.contract);
      } catch (e) {
        console.log(e);
        process.exit(1);
      }
    });
  });

  describe("Register User to Authority", function() {

    it("Should User register to Authority", async function() {
      try {
        const canRegister = await libUser.userRegisterAuthority(user.address, user.contract, authority.address);
        const isRegistered = await libUser.userIsRegisteredByAuthority(user.address, user.contract, authority.address);

        console.log('can register', canRegister);
        console.log('is registered', isRegistered);

        assert(canRegister && isRegistered);
      } catch (e) {
        console.log(e);
        process.exit(1);
      }
    });

    it("Should Authority register the User", async function() {
      try {
        const canRegister = await libAuthority.registerUser(authority.address, authority.contract, user.contract._address);

        assert(canRegister);
      } catch (e) {
        console.log(e);
        process.exit(1);
      }
    });
  });
});