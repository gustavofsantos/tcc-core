const Api = require('@parity/ap85');
const provider = new Api.Provider.Http('http://localhost:8545');
const api = new Api(provider);

api.
