import Api from "@parity/api";

// using local parity node as provider
const provider = new Api.Provider.Http('http:localhost:8545');
const api = new Api(provider);

