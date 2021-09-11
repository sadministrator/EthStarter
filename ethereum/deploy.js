const compiledFactory = require('./build/CampaignFactory.json');
const Web3 = require('web3');
const HDWalletProvider = require('truffle-hdwallet-provider');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
const provider = new HDWalletProvider(process.env.MNEMONIC, process.env.INFURA_ENDPOINT);
const web3 = new Web3(provider);

const deploy = async () => {
    const accounts = await web3.eth.getAccounts();

    const campaignFactory = await new web3.eth.Contract(compiledFactory.abi)
        .deploy({ data: compiledFactory.evm.bytecode.object })
        .send({ from: accounts[0], gas: '3000000' });

    console.log('Contract deployed to', campaignFactory.options.address);
};

deploy();