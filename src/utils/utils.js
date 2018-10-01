function range(n) {
  return ;
}

function genName() {
  return "Fulano de Tal";
}

function genPublicKey() {
  return "123456789abc";
}

function genUsers(number) {
  let users = [];
  for (let i = 0; i < number; i++) {
    users.push({
      name: genName(),
      pubKey: genPublicKey()
    });
  }
  return users;
}

module.exports = {
  genUsers
}