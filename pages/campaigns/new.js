import React, { Component } from 'react';
import web3 from '../../ethereum/web3';
import factory from '../../ethereum/factory';
import Layout from '../../components/Layout';
import { Form, Button, Input, Message } from 'semantic-ui-react';
import { Router } from '../../routes'

class CampaignNew extends Component {
    state = {
        minimumContribution: '',
        error: '',
        loading: false
    };

    onSubmit = async (event) => {
        event.preventDefault();

        this.setState({
            loading: true,
            error: ''
        });

        try {
            const accounts = await web3.eth.getAccounts();
            await factory.methods
                .createCampaign(this.state.minimumContribution)
                .send({
                    from: accounts[0]
                });

            Router.pushRoute('/');
        } catch (err) {
            this.setState({ error: err.message });
        }

        this.setState({ loading: false });
    };

    render() {
        return (
            <Layout>
                <h3>Create a Campaign</h3>

                <Form onSubmit={this.onSubmit} error={!!this.state.error}>
                    <Form.Field>
                        <label>Minimum Contribution</label>
                        <Input
                            value={this.state.minimumContribution}
                            onChange={event => this.setState({
                                minimumContribution: event.target.value
                            })}
                            placeholder='Wei'
                            label='Wei'
                            labelPosition='right'
                        />
                    </Form.Field>

                    <Message error header='Oops!' content={this.state.error} />

                    <Button primary loading={this.state.loading}>
                        Submit!
                    </Button>
                </Form>
            </Layout>
        );
    }
}

export default CampaignNew;