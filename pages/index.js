import React, { useState, useEffect } from 'react';
import { Card, Button } from 'semantic-ui-react';
import Link from 'next/link';

import Layout from '../components/Layout'
import factory from '../ethereum/factory';

function CampaignIndex() {
    const [campaigns, setCampaigns] = useState([]);

    useEffect(() => {
        async function fetchCampaigns() {
            const campaigns = await factory.methods.getCampaigns().call();
            setCampaigns(campaigns);
        }
        fetchCampaigns();
    });

    const renderCampaigns = () => {
        const items = campaigns.map(address => {
            return {
                header: address,
                description: (
                    <Link href={`/campaigns/${address}`}>
                        <a>View Campaign</a>
                    </Link>
                ),
                fluid: true,
                style: { overflowWrap: 'break-word' }
            }
        });

        return <Card.Group items={items} />;
    }

    return (
        <Layout>
            <h3>Open Campaigns</h3>
            <Link href='/campaigns/new'>
                <a>
                    <Button
                        floated='right'
                        content='Create Campaign'
                        icon='add'
                        primary
                    />
                </a>
            </Link>
            {renderCampaigns()}
        </Layout>
    );
}

export default CampaignIndex;