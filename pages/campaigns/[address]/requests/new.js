import React, { useState, useEffect } from 'react';
import Layout from '../../../../components/Layout';
import { Form, Input, Button, Message, Grid, Segment } from 'semantic-ui-react';
import web3 from '../../../../ethereum/web3';
import Campaign from '../../../../ethereum/campaign';
import Link from 'next/link';
import { useRouter } from 'next/router';

function RequestNew() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [description, setDescription] = useState('');
    const [value, setValue] = useState('');
    const [recipient, setRecipient] = useState('');
    const [isManager, setIsManager] = useState(false);

    const router = useRouter();
    const { address } = router.query;

    useEffect(() => {
        async function fetchRoles() {
            const accounts = await web3.eth.getAccounts();
            const campaign = Campaign(address);
            const manager = await campaign.methods.manager().call();
            setIsManager(accounts[0] === manager);
        }
        fetchRoles();
    });

    const onSubmit = async (event) => {
        event.preventDefault();

        if(!isManager) {
            alert(
                'You must be the campaign manager to create new spending requests.'
            );
            return;
        }

        setLoading(true);
        setError('');

        const campaign = Campaign(address);

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

            router.push(`/campaigns/${address}/requests`);
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    }

    return (
        <Layout>
            <Link href={`/campaigns/${address}/requests`}>
                <a>Back to Requests</a>
            </Link>
            <Segment style={{width: '70%'}}>
                <Grid>
                    <Grid.Column>
                        <h3>Create a Request</h3>
                        <Form
                            onSubmit={onSubmit}
                            error={!!error}
                        >
                            <Form.Field>
                                <Input
                                    value={description}
                                    onChange={event => setDescription(event.target.value)}
                                    label='Description'
                                    labelPosition='right'
                                    placeholder='Enter a brief description.'
                                />
                            </Form.Field>

                            <Form.Field>
                                <Input
                                    value={value}
                                    onChange={event => setValue(event.target.value)}
                                    label='Value'
                                    labelPosition='right'
                                    placeholder='Value in Ether'
                                />
                            </Form.Field>

                            <Form.Field>
                                <Input
                                    value={recipient}
                                    onChange={event => setRecipient(event.target.value)}
                                    label='Recipient'
                                    labelPosition='right'
                                    placeholder='Address of Recipient'
                                />
                            </Form.Field>

                            <Message error header='Oops!' content={error} />

                            <Button primary loading={loading} floated='right'>
                                Submit Request
                            </Button>
                        </Form>
                    </Grid.Column>
                </Grid>
            </Segment>
        </Layout>
    )
}

export default RequestNew;