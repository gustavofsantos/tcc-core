/**
 * reference: 
 * https://valanter.com/academy/non-classe/create-an-ethereum-owned-proof-of-authority-private-chain-poa/
 * https://wiki.parity.io/Proof-of-Authority-Chains
 * https://ethereum.stackexchange.com/questions/25299/how-to-connecting-the-nodes-when-parity-starting
 */

const fs = require('fs');

function genNetworkSpec(config) {
  return {
    "name": "PrivatePoA",
    "engine": {
      "authorityRound": {
        "params": {
          "blockReward": "0x4563918244F40000",
          "stepDuration": "5",
          "validators" : {
            "safeContract": "0x0000000000000000000000000000000000000005"
          }
        }
      }
    },
    "params": {
      "gasLimitBoundDivisor": "0x400",
      "maximumExtraDataSize": "0x20",
      "minGasLimit": "0x1388",
      "networkID" : config.networkID || "0x2323"
    },
    "genesis": {
      "seal": {
        "authorityRound": {
          "step": "0x0",
          "signature": "0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
        }
      },
      "difficulty": config.difficulty || "0x20000",
      "gasLimit": config.gasLimit || "0x5B8D80"
    },
    "accounts": config.authorityAccounts || {}
  }
}

function genConfig() {

}

function genNode(specOutput, configOutput) {
  const spec = genNetworkSpec();
  const config = genConfig();

  fs.writeFileSync(specOutput, JSON.stringify(spec));
  fs.writeFileSync(configOutput, JSON.stringify(config));
}

module.exports = genNode;