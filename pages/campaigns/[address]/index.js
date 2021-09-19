import React from 'react';
import { Card, Grid, Button } from 'semantic-ui-react';
import Link from 'next/link';

import factory from '../../../ethereum/factory';
import Campaign from '../../../ethereum/campaign';
import web3 from '../../../ethereum/web3';
import Layout from '../../../components/Layout'
import Contribute from '../../../components/Contribute';

function ShowCampaign(props) {
    const {
        address,
        manager,
        minimumContribution,
        balance,
        numRequests,
        numApprovers
    } = props;

    const renderCards = () => {
        const items = [
            {
                header: web3.utils.fromWei(balance, 'ether'),
                meta: 'Campaign Balance (Ether)',
                description: 'The campaign\'s current balance.',
                style: { overflowWrap: 'break-word' }
            },
            {
                header: address,
                meta: 'Address of the Campaign',
                description: 'The address which contributors can use to donate to this campaign.',
                style: { overflowWrap: 'break-word' }
            },
            {
                header: manager,
                meta: 'Address of Campaign Manager',
                description: `The manager created this campaign and can create requests to 
                disburse its balance.`,
                style: { overflowWrap: 'break-word' }
            },
            {
                header: web3.utils.fromWei(minimumContribution, 'ether'),
                meta: 'Minimum Contribution (Ether)',
                description: `The minimum contribution required to become a contributer to this 
                    campaign and be able to approve spending requests.`,
                style: { overflowWrap: 'break-word' }
            },
            {
                header: numRequests,
                meta: 'Number of Requests',
                description: 'The number of spending requests that the manager has created.',
                style: { overflowWrap: 'break-word' }
            },
            {
                header: numApprovers,
                meta: 'Number of Contributors',
                description: 'This is the number of people that have contributed to this campaign.',
                style: { overflowWrap: 'break-word' }
            },
        ];

        return <Card.Group items={items} />;
    };

    return (
        <Layout>
            <Grid>
                <Grid.Row>
                    <Grid.Column width={10}>
                        {renderCards()}
                    </Grid.Column>

                    <Grid.Column width={6}>
                        <Contribute address={address} />
                    </Grid.Column>
                </Grid.Row>

                <Grid.Row>
                    <Grid.Column>
                        <Link href={`/campaigns/${address}/requests`}>
                            <a>
                                <Button primary>
                                    View Requests
                                </Button>
                            </a>
                        </Link>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </Layout>
    );
}

export async function getStaticPaths() {
    const campaigns = await factory.methods.getCampaigns().call();

    const paths = campaigns.map(campaign => ({
        params: { address: campaign },
    }));

    return { paths, fallback: false };
}

export async function getStaticProps(context) {
    const { address } = context.params;
    const campaign = Campaign(address);
    const metrics = await campaign.methods.getMetrics().call();

    return {
        props: {
            address: address,
            minimumContribution: metrics[0],
            balance: metrics[1],
            numRequests: metrics[2],
            numApprovers: metrics[3],
            manager: metrics[4]
        },
        revalidate: 14,
    };
}

export default ShowCampaign;