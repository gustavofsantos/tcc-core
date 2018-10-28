const Leite = require('leite');
const keypair = require('keypair');

const leite = new Leite();

function getKeyPair() {
  const pair = keypair({ bits: 256 });
  return {
    public: pair.public,
    private: pair.private
  }
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
  getUsers
}