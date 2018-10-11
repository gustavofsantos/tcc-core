const IPFS = require('ipfs');
const { normal, success, error, warning } = require('./logger');
const node = new IPFS({
  repo: './.ipfs'
});

let ipfsReady = false;

function waitIpfsReady() {
  return new Promise((resolve, reject) => {
    if (ipfsReady) {
      resolve(true);
    } else {
      console.log(warning(' - Waiting for IPFS...'));
      node.on('ready', () => {
        console.log(success(' - IPFS is ready'));
        resolve(true);
      });

      node.on('error', () => {
        console.log(error(' - Could not start IPFS'));
        reject(false);
      });
    }
  });
}

function stopIPFS() {
  console.log(normal("Shutting down IPFS..."));
  node.stop();
}

/**
 * Push a string of data to IPFS
 * @param {object} data
 * @return {string}
 */
async function pushToIPFS(data) {
  console.log(normal(" - Pushing to IPFS:", data));
  try {
    const isReady = await waitIpfsReady();
    if (isReady) {
      const files = await node.files.add(Buffer.from(JSON.stringify(data)));
      console.log(success("Pushed: ", files));
      return files[0].hash;
    } else {
      return null;
    }
  } catch (e) {
    console.log(error("Not pushed."));
    console.log(e);
    return null;
  }
}

/**
 * Pull a string of data from IPFS
 * @param {string} cid
 * @return {string}
 */
async function pullFromIPFS(cid) {
  try {
    const isReady = await waitIpfsReady();
    if (isReady) {
      const data = node.files.cat(cid);
      return data.toString('utf8');
    } else {
      throw('IPFS is not ready');
    }
  } catch (e) {
    console.log(e);
    return null;
  }
}

module.exports = {
  pushToIPFS,
  pullFromIPFS,
  stopIPFS
}