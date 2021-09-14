import React from 'react';
import { Button, Card, Grid } from 'semantic-ui-react';
import Link from 'next/link';
import { useRouter } from 'next/router';

import factory from '../../../../ethereum/factory';
import Campaign from '../../../../ethereum/campaign';
import Layout from '../../../../components/Layout';
import RequestCard from '../../../../components/RequestCard';

function RequestIndex(props) {
    const renderCards = () => {
        const { address, requests, approverCount } = props;

        const cards = requests.map((request, index) => {
            return (
                <RequestCard
                    key={index}
                    address={address}
                    index={index}
                    request={request}
                    approverCount={approverCount}
                />
            )
        });

        return (
            <Card.Group>
                {cards}
            </Card.Group>
        );
    }

    return (
        <Layout>
            <Link href={`/campaigns/${props.address}`}>
                <a>Back to Campaign</a>
            </Link>
            <br /><br />
            <Grid>
                <Grid.Column width={13}>
                    {renderCards()}
                </Grid.Column>

                <Grid.Column width={3}>
                    <Link href={`/campaigns/${props.address}/requests/new`}>
                        <a>
                            <Button primary>
                                Create New Request
                            </Button>
                        </a>
                    </Link>
                </Grid.Column>
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
    const requestCount = await campaign.methods.requestCount().call();
    const requests = await Promise.all(
        Array(parseInt(requestCount)).fill().map((element, index) => {
            return campaign.methods.requests(index).call();
        })
    );
    const requestsSerialized = JSON.parse(JSON.stringify(requests));
    const approverCount = await campaign.methods.approverCount().call();

    return {
        props: {
            address,
            requests: requestsSerialized,
            approverCount
        },
        revalidate: 14,
    };
}

export default RequestIndex;