import React, { Component } from 'react';
import Layout from '../../../components/Layout';
import { Form, Input, Button, Message, Grid } from 'semantic-ui-react';
import web3 from '../../../ethereum/web3';
import Campaign from '../../../ethereum/campaign';
import { Router, Link } from '../../../routes';

class RequestNew extends Component {
    state = {
        loading: false,
        error: '',
        description: '',
        value: '',
        recipient: ''
    }

    static async getInitialProps(ctx) {
        return {
            address: ctx.query.address
        }
    }

    onSubmit = async (event) => {
        event.preventDefault();

        this.setState({
            loading: true,
            error: ''
        });

        const { description, value, recipient } = this.state;
        const campaign = Campaign(this.props.address);

        try {
            const accounts = await web3.eth.getAccounts();

            await campaign.methods
                .createRequest(
                    description,
                    web3.utils.toWei(value, 'ether'),
                    recipient
                )
                .send({
                    from: accounts[0],
                    gas: '1000000'
                });

            Router.pushRoute(`/campaigns/${this.props.address}/requests`)
        } catch (err) {
            this.setState({ error: err.message });
        }
        this.setState({ loading: false })
    };

    render() {
        return (
            <Layout>
                <Link route={`/campaigns/${this.props.address}/requests`}>
                    <a>Back to Requests</a>
                </Link>
                <Grid>
                    <Grid.Column width={12}>
                        <h3>Create a Request</h3>
                        <Form
                            onSubmit={this.onSubmit}
                            error={!!this.state.error}
                        >
                            <Form.Field>
                                <Input
                                    value={this.state.description}
                                    onChange={event => this.setState({
                                        description: event.target.value
                                    })}
                                    label='Description'
                                    labelPosition='right'
                                    placeholder='Enter a brief description.'
                                />
                            </Form.Field>

                            <Form.Field>
                                <Input
                                    value={this.state.value}
                                    onChange={event => this.setState({
                                        value: event.target.value
                                    })}
                                    label='Value'
                                    labelPosition='right'
                                    placeholder='Value in Ether'
                                />
                            </Form.Field>

                            <Form.Field>
                                <Input
                                    value={this.state.recipient}
                                    onChange={event => this.setState({
                                        recipient: event.target.value
                                    })}
                                    label='Recipient'
                                    labelPosition='right'
                                    placeholder='Address of Recipient'
                                />
                            </Form.Field>

                            <Message error header='Oops!' content={this.state.error} />

                            <Button primary loading={this.state.loading}>
                                Submit Request
                            </Button>
                        </Form>
                    </Grid.Column>
                </Grid>
            </Layout>
        )
    }
}

export default RequestNew;