const path = require('path');
const solc = require('solc');
const fs   = require('fs-extra');

function compile() {
	const buildPath = path.resolve(__dirname, 'build');
    // remove all compiled contracts
    console.log('Removing old contracts...')
    fs.removeSync(buildPath);

    const userPath = path.resolve(__dirname, 'contracts', 'User.sol');
    const authorityPath = path.resolve(__dirname, 'contracts', 'Authority.sol');

    const userContractSource = fs.readFileSync(userPath, 'utf8');
    const authorityContractSource = fs.readFileSync(authorityPath, 'utf8');

    console.log('compiling...');
    const userContractOutput = solc.compile(userContractSource, 1).contracts;
    const authorityContractOutput = solc.compile(authorityContractSource, 1).contracts;

    // ensure that build folder exists
    fs.ensureDirSync(buildPath);

    console.log('writing contracts...')
    for (const contract in userContractOutput) {
	fs.outputJsonSync(path.resolve(buildPath, `${contract.replace(':', '')}.json`), userContractOutput[contract]);
    }

    for (const contract in authorityContractOutput) {
	fs.outputJsonSync(path.resolve(buildPath, `${contract.replace(':', '')}.json`), authorityContractOutput[contract]);
    }
}

compile();

module.exports = compile;

