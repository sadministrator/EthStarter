import React, { Component } from 'react';
import web3 from '../../ethereum/web3';
import factory from '../../ethereum/factory';
import Layout from '../../components/Layout';
import { Form, Button, Input, Message } from 'semantic-ui-react';

class CampaignNew extends Component {
    state = {
        minimumContribution: '',
        errorMessage: '',
        loading: false
    }

    onSubmit = async (event) => {
        event.preventDefault();

        this.setState({
            loading: true,
            errorMessage: ''
        });

        try {
            const accounts = await web3.eth.getAccounts();
            await factory.methods
                .createCampaign(this.state.minimumContribution)
                .send({
                    from: accounts[0]
                });
        } catch (err) {
            this.setState({ errorMessage: err.message });
        }

        this.setState({ loading: false });
    };

    render() {
        return (
            <Layout>
                <h3>Create a Campaign</h3>

                <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
                    <Form.Field>
                        <label>Minimum Contribution</label>
                        <Input
                            placeholder='$$$'
                            label='Wei'
                            labelPosition='right'
                            value={this.state.minimumContribution}
                            onChange={(event) => {
                                this.setState({
                                    minimumContribution: event.target.value
                                })
                            }}
                        />
                    </Form.Field>

                    <Message error header='Oops!' content={this.state.errorMessage} />

                    <Button primary loading={this.state.loading}>
                        Submit!
                    </Button>
                </Form>
            </Layout>
        );
    }
}

export default CampaignNew;