const IPFS = require('ipfs');
const { normal, success, error, warning } = require('./logger');
const node = new IPFS({
  repo: './.ipfs'
});


function waitIpfsReady() {
  return new Promise((resolve, reject) => {
    node.on('ready', resolve);
    node.on('error', reject);
  });
}

function stopIPFS() {
  console.log(normal("Shutting down IPFS..."));
  node.stop();
}

/**
 * Push a string of data to IPFS
 * @param {object} dataToPush
 * @return {string}
 */
function pushToIPFS(dataToPush) {
  return new Promise((resolve, reject) => {
    if (Object.keys(dataToPush).length > 0) {
      node.files.add(Buffer.from(JSON.stringify(dataToPush)), (err, files) => {
        if (err) {
          console.log(err);
          reject(err);
        } 
        else {
          resolve(files[0].hash);
        }
      });
    } else {
      reject(`Trying to push an empty object: ${dataToPush}`);
    }
  });
}

/**
 * Pull a string of data from IPFS
 * @param {string} cid
 * @return {string}
 */
function pullFromIPFS(cid) {
  return new Promise((resolve, reject) => {
    if (cid) {
      node.files.cat(cid, (err, file) => {
        if (err) reject(err);
        else {
          const stringFile = file.toString('utf8');
          resolve(stringFile);
        }
      })
    } else {
      reject(`IPFS CID is empty: ${cid}`);
    }
  });
}

module.exports = {
  pushToIPFS,
  pullFromIPFS,
  stopIPFS,
  waitIpfsReady
}