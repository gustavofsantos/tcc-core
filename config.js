const path = require('path');

const numberAccounts = 50;
const logFile = path.join(__dirname, 'out.log');

module.exports = {
  numberAccounts,
  logFile
}