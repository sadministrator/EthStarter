import React, { Component } from 'react';
import Layout from '../components/Layout'
import factory from '../ethereum/factory';
import { Card, Button } from 'semantic-ui-react';

class CampaignIndex extends Component {
    static async getInitialProps() {
        const campaigns = await factory.methods.getCampaigns().call();
        return { campaigns }
    }

    renderCampaigns() {
        const items = this.props.campaigns.map(address => {
            return {
                header: address,
                description: <a>localhost:3000/{address}</a>,
                fluid: true
            }
        });

        return <Card.Group items={items} />;
    }

    render() {
        return (
            <Layout>
                <h3>Open Campaigns</h3>
                <Button
                    floated='right'
                    content='Create Campaign'
                    icon='add'
                    primary
                />
                {this.renderCampaigns()}
            </Layout>
        );
    }
}

export default CampaignIndex;