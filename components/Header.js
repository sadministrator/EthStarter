import React, { useState, useEffect } from 'react';
import { Menu, Search, Input } from 'semantic-ui-react';
import { useRouter } from 'next/router';
import Link from 'next/link';

import factory from '../ethereum/factory'

function Header() {
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);
    const [value, setValue] = useState('');
    const [campaigns, setCampaigns] = useState([]);

    const router = useRouter();

    useEffect(() => {
        async function fetchCampaigns() {
            const campaignsArray = await factory.methods.getCampaigns().call();
            const campaignsObjects = campaignsArray.map(campaign => {
                return {
                    title: campaign
                };
            });
            setCampaigns(campaignsObjects);
        }
        fetchCampaigns();
    }, []);

    const searchChange = (event) => {
        event.preventDefault();

        setValue(event.target.value);
        setLoading(true);

        const searchResults = campaigns.filter(
            campaign => campaign.title.match(event.target.value)
        );

        setResults(searchResults);
        setLoading(false);
    };

    return (
        <Menu style={{ marginTop: '12px' }}>
            <Link href='/'>
                <a className='item'>EthStarter</a>
            </Link>

            <Search
                fluid
                className='item'
                style={{ width: '70%' }}
                loading={loading}
                onResultSelect={
                    (event, data) => {
                        router.push(`/campaigns/${data.result.title}`);
                    }
                }
                onSearchChange={searchChange}
                results={results}
                value={value}
            />

            <Menu.Menu position='right'>
                <Link href='/'>
                    <a className='item'>Campaigns</a>
                </Link>

                <Link href='/campaigns/new'>
                    <a className='item'>+</a>
                </Link>
            </Menu.Menu>
        </Menu>
    );
}

export default Header;