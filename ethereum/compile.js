const path = require('path');
const solc = require('solc');
const fs = require('fs-extra');

const buildPath = path.resolve(__dirname, 'build');
fs.removeSync(buildPath);

const sourcePath = path.resolve(__dirname, 'contracts', 'Campaign.sol');
const source = fs.readFileSync(sourcePath, 'utf8');
const output = solc.compile(source, 1).contracts;

fs.ensureDirSync(buildPath);

for (let contract in output) {
    fs.outputJsonSync(
        path.resolve(buildPath, contract.replace(/:/g, '') + '.json'),
        output[contract]
    );
}