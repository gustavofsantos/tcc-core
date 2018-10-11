const colors = require('colors');

function normal(text) {
  return colors.white(text);
}

function success(text) {
  return colors.green(text);
}

function error(text) {
  return colors.red(text);
}

function warning(text) {
  return colors.yellow(text);
}

module.exports = {
  normal, success, error, warning
};