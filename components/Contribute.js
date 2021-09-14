import React, { useState } from 'react';
import web3 from '../ethereum/web3';
import Campaign from '../ethereum/campaign';
import { Form, Input, Button, Message, Segment } from 'semantic-ui-react'
import { useRouter } from 'next/router';

function Contribute() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [contributionAmount, setContributionAmount] = useState('');

    const router = useRouter();

    const onSubmit = async (event) => {
        event.preventDefault();

        setLoading(true);
        setError('');

        const campaign = Campaign(this.props.address);

        try {
            const accounts = await web3.eth.getAccounts();

            await campaign.methods.contribute().send({
                from: accounts[0],
                value: web3.utils.toWei(this.state.contributionAmount, 'ether')
            });

            router.replace(`/campaigns/${this.props.address}`);
        } catch (err) {
            setError(err.msg);
        }

        setLoading(false);
    };

    return (
        <Segment>
            <Form onSubmit={onSubmit} error={!!error}>
                <Form.Field>
                    <label>Amount to Contribute</label>
                    <Input
                        value={contributionAmount}
                        onChange={event => setContributionAmount(event.target.value)}
                        placeholder='Ether'
                        label='Ether'
                        labelPosition='right'
                    />
                </Form.Field>

                <Message error header='Oops!' content={error} />

                <Button
                    primary
                    loading={loading}>
                    Contribute!
                </Button>
            </Form>
        </Segment>
    );
}

export default Contribute;