import React, { Component } from 'react';
import Campaign from '../../../ethereum/campaign';
import Layout from '../../../components/Layout';
import { Button, Card } from 'semantic-ui-react';
import { Link } from '../../../routes';

class RequestIndex extends Component {
    static async getInitialProps(ctx) {
        const campaign = Campaign(ctx.query.address);
        const requestCount = await campaign.methods.getRequestsCount().call();
        const requests = await Promise.all(
            Array(parseInt(requestCount)).fill().map((element, index) => {
                return campaign.methods.requests(index).call();
            })
        );

        return {
            address: ctx.query.address,
            requests: requests
        }
    }

    renderCards() {
        const { requests } = this.props;

        const items = requests.map(request => {
            return {
                header: request.value,
                meta: request.recipient,
                description: request.description,
                style: { overflowWrap: 'break-word' },
                //flud: true
            }
        });

        return <Card.Group items={items} />
    }

    render() {
        return (
            <Layout>
                {this.renderCards()}

                <Link route={`/campaigns/${this.props.address}/new`}>
                    <a>
                        <Button primary>
                            Create New Request
                        </Button>
                    </a>
                </Link>
            </Layout>
        )
    }
}

export default RequestIndex;