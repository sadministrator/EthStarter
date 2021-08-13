const compiledFactory = require('./build/CampaignFactory.json');
const Web3 = require('web3');
const HDWalletProvider = require('truffle-hdwallet-provider');
require('dotenv').config();

const provider = new HDWalletProvider(process.env.MNEMONIC, process.env.INFURA_ACCESS_POINT);
const web3 = new Web3(provider);

const deploy = async () => {
    const accounts = await web3.eth.getAccounts();

    const campaignFactory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
        .deploy({ data: compiledFactory.bytecode })
        .send({ from: accounts[0], gas: '1000000' });

    console.log('Contract deployed to', campaignFactory.options.address);
};

deploy();