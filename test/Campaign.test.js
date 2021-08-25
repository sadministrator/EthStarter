const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const compiledFactory = require('../ethereum/build/CampaignFactory.json');
const compiledCampaign = require('../ethereum/build/Campaign.json');

let accounts;
let factory;
let campaignAddress;
let campaign;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
        .deploy({ data: compiledFactory.bytecode })
        .send({ from: accounts[0], gas: '1000000' });

    await factory.methods.createCampaign('100').send({
        from: accounts[0],
        gas: '1000000'
    });

    [campaignAddress] = await factory.methods.getCampaigns().call();
    campaign = await new web3.eth.Contract(
        JSON.parse(compiledCampaign.interface),
        campaignAddress
    );
});

describe('Campaigns', () => {
    it('deploys a factory and a campaign', () => {
        assert.ok(factory.options.address);
        assert.ok(campaign.options.address);
    });

    it('marks caller as the campaign manager', async () => {
        const manager = await campaign.methods.manager().call();
        assert.strictEqual(accounts[0], manager);
    });

    it('allows people to contribute money and marks them as approvers', async () => {
        await campaign.methods.contribute().send({
            value: '1000',
            from: accounts[1]
        });

        const isContributor = await campaign.methods.approvers(accounts[1]).call();
        assert(isContributor);
    })

    it('requires a minimum contribution', async () => {
        try {
            campaign.methods.contribute().send({
                value: '10',
                from: accounts[1]
            });
            assert(false);
        } catch (err) {
            assert(err);
        }
    });

    it('allows manager to make a request', async () => {
        const description = 'Buy lemons.'
        await campaign.methods.createRequest(description, '100', accounts[1])
            .send({
                from: accounts[0],
                gas: '1000000'
            });

        const request = await campaign.methods.requests(0).call();

        assert.strictEqual(description, request.description);
    });

    it('processes requests', async () => {
        let startBalance = await web3.eth.getBalance(accounts[2]);
        startBalance = web3.utils.fromWei(startBalance, 'ether');
        startBalance = parseFloat(startBalance);

        await campaign.methods.contribute().send({
            from: accounts[1],
            value: web3.utils.toWei('10', 'ether')
        });

        await campaign.methods
            .createRequest(
                'Buy Ford F1-50.',
                web3.utils.toWei('9', 'ether'),
                accounts[2]
            )
            .send({
                from: accounts[0],
                gas: '1000000'
            });

        await campaign.methods.approveRequest(0).send({
            from: accounts[1],
            gas: '1000000'
        });

        await campaign.methods.finalizeRequest(0).send({
            from: accounts[0],
            gas: '1000000'
        });

        let balance = await web3.eth.getBalance(accounts[2]);
        balance = web3.utils.fromWei(balance, 'ether');
        balance = parseFloat(balance);
        assert(balance > startBalance);
    });

    it('does not increment approverCount if the same approver contributes more than once', async () => {
        await campaign.methods.contribute().send({
            from: accounts[0],
            value: '1000'
        });

        const approverCount = await campaign.methods.approverCount().call();

        await campaign.methods.contribute().send({
            from: accounts[0],
            value: '1000'
        });

        const approverCountEnd = await campaign.methods.approverCount().call();

        assert(approverCount == approverCountEnd);
    });
});