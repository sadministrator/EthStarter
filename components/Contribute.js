import React, { Component } from 'react';
import web3 from '../ethereum/web3';
import Campaign from '../ethereum/campaign';
import { Form, Input, Button, Message } from 'semantic-ui-react'
import { Router } from '../routes';

class Contribute extends Component {
    state = {
        loading: false,
        error: '',
        contributionAmount: ''
    };

    onSubmit = async (event) => {
        event.preventDefault();

        const campaign = Campaign(this.props.address);

        this.setState({
            loading: true,
            error: ''
        });

        try {
            const accounts = await web3.eth.getAccounts();

            await campaign.methods.contribute().send({
                from: accounts[0],
                value: web3.utils.toWei(this.state.contributionAmount, 'ether')
            });

            Router.replaceRoute(`/campaigns/${this.props.address}`);
        } catch (err) {
            this.setState({ error: err.msg });
        }

        this.setState({ loading: false });
    };

    render() {
        return (
            <Form onSubmit={this.onSubmit} error={!!this.state.error}>
                <Form.Field>
                    <label>Amount to Contribute</label>
                    <Input
                        value={this.state.contributionAmount}
                        onChange={event => this.setState({
                            contributionAmount: event.target.value
                        })}
                        placeholder='Ether'
                        label='Ether'
                        labelPosition='right'
                    />
                </Form.Field>

                <Message error header='Oops!' content={this.state.error} />

                <Button primary loading={this.state.loading}>
                    Contribute!
                </Button>
            </Form>
        )
    }
}

export default Contribute;