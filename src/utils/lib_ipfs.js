const IPFS = require('ipfs');
const node = new IPFS();

let ipfsReady = false;

function waitIpfsReady() {
  return new Promise((resolve, reject) => {
    if (ipfsReady) {
      resolve(true);
    } else {
      node.on('ready', () => {
        resolve(true);
      });

      node.on('error', () => {
        reject(false);
      });
    }
  });
}

function stopIPFS() {
  node.stop();
}

/**
 * Push a string of data to IPFS
 * @param {string} data
 * @return {string}
 */
async function pushToIPFS(data) {
  try {
    const isReady = await waitIpfsReady();
    if (isReady) {
      const files = await node.files.add(Buffer.from(data));
      return files[0].hash;
    } else {
      return null;
    }
  } catch (e) {
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
    const data = node.files.cat(cid);
    return data.toString('utf8');
  } catch (e) {
    console.log(e);
    return null;
  }
}

module.exports = {
  pushToIPFS,
  pullFromIPFS
}