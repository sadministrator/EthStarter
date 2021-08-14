import web3 from './web3';
import compiledFactory from './build/CampaignFactory.json';

const factory = new web3.eth.Contract(
    JSON.parse(compiledFactory.interface),
    process.env.FACTORY_ADDRESS
);

export default factory;