const Leite = require('leite');
const { generateKeyPairSync } = require('crypto');

const leite = new Leite();

/**
 * 
 * @param {string} secret User secret password
 */
function getKeyPair(secret) {
  const { publicKey, privateKey } = generateKeyPairSync('ec', {
    namedCurve: 'secp521r1',
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
      cipher: 'aes256',
      passphrase: secret
    }
  });

  return {
    publicKey,
    privateKey
  }
}

// function formatKey(key, type) {
//   const keyBody = key.split('\n').slice(1, -2).join('\n');

//   if (type === 'rsa') {
//     const rsaHeader = '-----BEGIN RSA PRIVATE KEY-----\n';
//     const rsaFooter = '\n-----END RSA PRIVATE KEY-----';
//     return rsaHeader + keyBody + rsaFooter;
//   }
//   else if (type === 'ec') {

//   }
//   else {
//     return null;
//   }
// }

// /**
//  * 
//  * @param {string} secret User secret password
//  */
// function getKeyPair(secret) {
//   const keyPair = generateKeyPairSync('rsa', {
//     modulusLength: 4096,
//     publicKeyEncoding: {
//       type: 'spki',
//       format: 'pem'
//     },
//     privateKeyEncoding: {
//       type: 'pkcs8',
//       format: 'pem',
//       cipher: 'aes256',
//       passphrase: secret
//     }
//   });

//   const publicKey = formatKey(keyPair.publicKey, 'rsa');
//   const privateKey = formatKey(keyPair.privateKey, 'rsa');

//   return {
//     publicKey,
//     privateKey
//   }
// }

function getKeyPair() {
  const pair = crypto.createECDH('secp521r1');
  const keys = pair.generateKeys('hex');

  return {
    publicKey: keys.getPublicKey('hex'),
    privateKey: keys.getPrivateKey('hex')
  };
}

function getUser() {
  return {
    name: leite.pessoa.nome(),
    id: leite.pessoa.cpf(),
    born: leite.pessoa.nascimento({
      string: true,
      formato: "DD/MM/YYYY"
    }),
    location: leite.localizacao.logradouro(),
    neighborhood: leite.localizacao.bairro(),
    postcode: leite.localizacao.cep(),
    city: leite.localizacao.cidade(),
    province: leite.localizacao.estado()
  }
}

function getUsers(n) {
  return [...Array(n)].map(n => getUser());
}

module.exports = {
  getUser,
  getUsers,
  getKeyPair
}