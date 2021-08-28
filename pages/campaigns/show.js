import React, { Component } from 'react';
import Layout from '../../components/Layout'
import Campaign from '../../ethereum/campaign';
import { Card, Grid, Button } from 'semantic-ui-react';
import web3 from '../../ethereum/web3';
import Contribute from '../../components/Contribute';
import { Link } from '../../routes';

class ShowCampaign extends Component {
    static async getInitialProps(ctx) {
        const campaign = Campaign(ctx.query.address);
        const metrics = await campaign.methods.getMetrics().call();
        return {
            address: ctx.query.address,
            minimumContribution: metrics[0],
            balance: metrics[1],
            numRequests: metrics[2],
            numApprovers: metrics[3],
            manager: metrics[4]
        };
    }

    renderCards() {
        const {
            address,
            manager,
            minimumContribution,
            balance,
            numRequests,
            numApprovers
        } = this.props;

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
                header: minimumContribution,
                meta: 'Minimum Contribution (Wei)',
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
    }

    render() {
        return (
            <Layout>
                <Grid>
                    <Grid.Row>
                        <Grid.Column width={10}>
                            {this.renderCards()}
                        </Grid.Column>

                        <Grid.Column width={6}>
                            <Contribute address={this.props.address} />
                        </Grid.Column>
                    </Grid.Row>

                    <Grid.Row>
                        <Grid.Column>
                            <Link route={`/campaigns/${this.props.address}/requests`}>
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
}

export default ShowCampaign;