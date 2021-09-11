import web3 from './web3';
import compiledFactory from './build/CampaignFactory.json';

const factory = new web3.eth.Contract(
    compiledFactory.abi,
    process.env.NEXT_PUBLIC_FACTORY_ADDRESS
);

export default factory;