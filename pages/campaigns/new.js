import React, { useState } from 'react';
import web3 from '../../ethereum/web3';
import factory from '../../ethereum/factory';
import Layout from '../../components/Layout';
import { Form, Button, Input, Message, Segment, Grid } from 'semantic-ui-react';
import { useRouter } from 'next/router';

function CampaignNew() {
    const [minimumContribution, setMinimumContribution] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const onSubmit = async (event) => {
        event.preventDefault();

        setLoading(true);
        setError('');

        try {
            const accounts = await web3.eth.getAccounts();
            await factory.methods
                .createCampaign(web3.utils.toWei(minimumContribution, 'ether'))
                .send({
                    from: accounts[0]
                });

            router.push('/');
        } catch (err) {
            setError(err.message );
        }

        setLoading(false);
    };

    return (
        <Layout>
            <h3>Create a Campaign</h3>
            <Grid>
                <Grid.Row>
                    <Segment
                        style={{
                            textAlign: 'left',
                            width: '50%'
                        }}
                    >
                        <Form
                            onSubmit={onSubmit}
                            error={!!error}
                        >
                            <Form.Field>
                                <label>Minimum Contribution</label>
                                <Input
                                    value={minimumContribution}
                                    onChange={event => setMinimumContribution(event.target.value)}
                                    placeholder='Eth'
                                    label='Eth'
                                    labelPosition='right'
                                />
                            </Form.Field>

                            <Message
                                error
                                header='Oops!'
                                content={error}
                            />

                            <Button
                                primary
                                floated='right'
                                loading={loading}
                            >
                                Submit!
                            </Button>
                        </Form>
                    </Segment>
                </Grid.Row>
            </Grid>
        </Layout>
    );
}

export default CampaignNew;