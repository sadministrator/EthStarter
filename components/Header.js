import React, { Component } from 'react';
import { Menu, Search, Input } from 'semantic-ui-react';
import { Router, Link } from '../routes';
import factory from '../ethereum/factory'

class Header extends Component {
    componentDidMount = async () => {
        let campaigns = await factory.methods.getCampaigns().call();
        campaigns = campaigns.map(campaign => {
            return {
                title: campaign
            };
        });

        this.setState({
            campaigns
        });
    }

    state = {
        loading: false,
        results: [],
        value: '',
        campaigns: []
    }

    searchChange = (event) => {
        event.preventDefault();

        this.setState({
            value: event.target.value,
            loading: true
        });

        const results = this.state.campaigns
            .filter(campaign => campaign.title.match(event.target.value));

        this.setState({
            results,
            loading: false
        });
    };

    render() {
        return (
            <Menu style={{ marginTop: '12px' }}>
                <Link route='/'>
                    <a className='item'>EthStarter</a>
                </Link>

                <Search
                    style={{ width: '100%' }}
                    fluid
                    loading={this.state.loading}
                    onResultSelect={
                        (event, data) => {
                            Router.pushRoute(`/campaigns/${data.result.title}`);
                        }
                    }
                    onSearchChange={this.searchChange}
                    results={this.state.results}
                    value={this.state.balue}
                />

                <Menu.Menu position='right'>
                    <Link route='/'>
                        <a className='item'>Campaigns</a>
                    </Link>

                    <Link route='/campaigns/new'>
                        <a className='item'>+</a>
                    </Link>
                </Menu.Menu>
            </Menu>
        )
    }
}

export default Header;