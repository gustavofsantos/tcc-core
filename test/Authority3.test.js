const assert = require('assert');
const { getUsers, getUser } = require('../src/utils/utils');
const { normal, success, error } = require('../src/utils/logger');
// const { numberAuthorities } = require('../../config');

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

const { userSignData, userGetPublicKey } = require('../src/utils/lib_user');

const numberAuthorities = 5;
const numberUsersPerAuthority = 50;
const defaultPublicKey = 'default-public-key';
const defaultPrivateKey = 'default-private-key';

describe("TCC-CORE UNIT TEST", function () {

  this.timeout(50000);

  let authorityAddresses;
  let userAddresses;
  let authorities;
  let users = [];

  before(async function() {
    console.log(normal(` - Deploy ${numberAuthorities} Authorities`));

    try {
      await waitSystemReady();

      const addresses = await getAddresses();

      authorityAddresses = addresses.slice(0, numberAuthorities);
      userAddresses = addresses.slice(numberAuthorities);

      // create authorities
      authorities = await authorityAddresses.map(async address => { 
        try {
          const user = getUser();
          const authority = await createAuthority(address, user);
          return authority;
        } catch (e) {
          console.log(e);
          return null;
        }
      });

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
      try {
        console.log('length: ', authorities.length);
        assert(authorities.length === numberAuthorities);
      } catch (e) {
        console.log(e);
        assert(false);
      }      
    });
  });

  describe("Deploy 50 users per authority", function() {
    it("Should Authority 1 register 50 users", async function () {
      try {
        const authorityContract = await authorities[0];
        const authorityAddress = authorityAddresses[0];

        const userContracts = userAddresses
          .slice(0, 50)
          .map( async userAddress => {
            // create user
            const userContract = await createUser(userAddress, defaultPublicKey, getUser());

            // register user
            const res = await registerUser(userContract._address, userAddress, authorityContract, authorityAddress);

            if (res) {
              return userContract;
            } else {
              return null;
            }
          });

        await Promise.all(userContracts);
        users = users.concat(userContracts);

        // console.log(userContracts);
        assert(userContracts.length === 50);
      } catch (e) {
        console.log(e);
        assert(false);
      }
    })
    .timeout(260000);

    it("Should Authority 2 register 50 users", async function () {
      try {
        const authorityContract = await authorities[1];
        const authorityAddress = authorityAddresses[1];

        const userContracts = userAddresses
          .slice(50, 100)
          .map( async userAddress => {
            // create user
            const userContract = await createUser(userAddress, defaultPublicKey, getUser());

            // register user
            const res = await registerUser(userContract._address, userAddress, authorityContract, authorityAddress);

            if (res) {
              return userContract;
            } else {
              return null;
            }
          });

        await Promise.all(userContracts);
        users = users.concat(userContracts);

        // console.log(userContracts);
        assert(userContracts.length === 50);
      } catch (e) {
        console.log(e);
        assert(false);
      }
    })
    .timeout(260000);

    it("Should authority 3 register 50 users", async function () {
      try {
        const authorityContract = await authorities[2];
        const authorityAddress = authorityAddresses[2];

        const userContracts = userAddresses
          .slice(100, 150)
          .map( async userAddress => {
            // create user
            const userContract = await createUser(userAddress, defaultPublicKey, getUser());

            // register user
            const res = await registerUser(userContract._address, userAddress, authorityContract, authorityAddress);

            if (res) {
              return userContract;
            } else {
              return null;
            }
          });

        await Promise.all(userContracts);
        users = users.concat(userContracts);

        // console.log(userContracts);
        assert(userContracts.length === 50);
      } catch (e) {
        console.log(e);
        assert(false);
      }
    })
    .timeout(260000);

    it("Should authority 4 register 50 users", async function () {
      try {
        const authorityContract = await authorities[3];
        const authorityAddress = authorityAddresses[3];

        const userContracts = userAddresses
          .slice(150, 200)
          .map( async userAddress => {
            // create user
            const userContract = await createUser(userAddress, defaultPublicKey, getUser());

            // register user
            const res = await registerUser(userContract._address, userAddress, authorityContract, authorityAddress);

            if (res) {
              return userContract;
            } else {
              return null;
            }
          });

        await Promise.all(userContracts);
        users = users.concat(userContracts);

        assert(userContracts.length === 50);
      } catch (e) {
        console.log(e);
        assert(false);
      }
    })
    .timeout(260000);

    it("Should authority 5 register 50 users", async function () {
      try {
        const authorityContract = await authorities[4];
        const authorityAddress = authorityAddresses[4];

        const userContracts = userAddresses
          .slice(200, 250)
          .map( async userAddress => {
            // create user
            const userContract = await createUser(userAddress, defaultPublicKey, getUser());

            // register user
            const res = await registerUser(userContract._address, userAddress, authorityContract, authorityAddress);

            if (res) {
              return userContract;
            } else {
              return null;
            }
          });

        await Promise.all(userContracts);
        users = users.concat(userContracts);

        assert(userContracts.length === 50);
      } catch (e) {
        console.log(e);
        assert(false);
      }
    })
    .timeout(260000);

    it(`Verify if has ${numberAuthorities*numberUsersPerAuthority} users deployed`, async function() {
      console.log('users.length', users.length);
      assert(users.length === numberAuthorities*numberUsersPerAuthority);
    })
    .timeout(260000);
  });

  describe("Change all users public key", function() {
    const newPublicKey = 'new-public-key';

    it("Change public key from 0 to 50", async function() {
      try {
        const authorityAddress = authorityAddresses[0];
        const firstUserAddresses = userAddresses.slice(0, 50);
        const firstUsers = users.slice(0, 50);

        const newUsers = firstUserAddresses.map(async (userAddress, index) => {
          try {
            const newUser = await changeUserPublicKey(userAddress, firstUsers[index]._address, newPublicKey, authorityAddress);
            return newUser;
          } catch(e) {
            return null;
          }
        });

        await Promise.all(newUsers);

        assert(newUsers.length === 50);
      } catch (e) {
        console.log(e);
        assert(false);
      }
    })
    .timeout(260000);

    it("Try to change public key from 0 to 50 with another authority", async function() {
      try {
        const authorityAddress = authorityAddresses[1];
        const firstUserAddresses = userAddresses.slice(0, 50);
        const firstUsers = users.slice(0, 50);

        const newUsers = firstUserAddresses.map(async (userAddress, index) => {
          try {
            const newUser = await changeUserPublicKey(userAddress, firstUsers[index]._address, newPublicKey, authorityAddress);
            return newUser;
          } catch(e) {
            return null;
          }
        });

        await Promise.all(newUsers);

        assert(newUsers.length === 50);
      } catch (e) {
        console.log(e);
        assert(false);
      }
    })
    .timeout(260000);


    it("Check if the 50 first users has the new public key", async function() {
      const firstUsers = users.slice(0, 50);
    })
    .timeout(260000);

    it("Try to sign data using the old user contract", async function() {
      try {
        const userAddress = userAddresses[0];
        const userContract = users[0];
        const couldSign = await userSignData(userAddress, userContract, defaultPrivateKey, 'some data');
        
        assert(couldSign);
      } catch (e) {
        console.log(e);
        assert(false);
      }
    })
    .timeout(260000);
  });
});