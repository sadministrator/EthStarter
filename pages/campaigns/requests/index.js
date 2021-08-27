import React, { Component } from 'react';
import Campaign from '../../../ethereum/campaign';
import Layout from '../../../components/Layout';
import { Button, Card, Grid } from 'semantic-ui-react';
import { Link } from '../../../routes';
import RequestCard from '../../../components/RequestCard';

class RequestIndex extends Component {
    static async getInitialProps(ctx) {
        const campaign = Campaign(ctx.query.address);
        const requestCount = await campaign.methods.getRequestsCount().call();
        const requests = await Promise.all(
            Array(parseInt(requestCount)).fill().map((element, index) => {
                return campaign.methods.requests(index).call();
            })
        );
        const approverCount = await campaign.methods.approverCount().call();

        return {
            address: ctx.query.address,
            requests,
            approverCount
        }
    }

    renderCards() {
        const { address, requests, approverCount } = this.props;

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
        )
    }

    render() {
        return (
            <Layout>
                <Link route={`/campaigns/${this.props.address}`}>
                    <a>Back to Campaign</a>
                </Link>
                <Grid>
                    <Grid.Column width={13}>
                        {this.renderCards()}
                    </Grid.Column>

                    <Grid.Column width={3}>
                        <Link route={`/campaigns/${this.props.address}/new`}>
                            <a>
                                <Button primary>
                                    Create New Request
                                </Button>
                            </a>
                        </Link>
                    </Grid.Column>
                </Grid>
            </Layout>
        )
    }
}

export default RequestIndex;