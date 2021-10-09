import Web3 from 'web3';

let web3;

(async () => {
    if (typeof window !== 'undefined' && typeof window.web3 !== 'undefined') {
        window.ethereum.request({ method: 'eth_requestAccounts' });
        web3 = new Web3(window.ethereum);

        const chainId = await web3.eth.net.getId();
        if (chainId != 4) {
            alert('You need to be connected to the Rinkeby network in Metamask in order to use this dApp.');
        }
    } else {
        const provider = new Web3.providers.HttpProvider(
            process.env.INFURA_ENDPOINT
        );
    
        web3 = new Web3(provider);
    }
})();

export default web3;