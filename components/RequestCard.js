import React, { useEffect, useState } from 'react';
import { Card, Button, Message } from 'semantic-ui-react';
import { useRouter } from 'next/router';

import Campaign from '../ethereum/campaign';
import web3 from '../ethereum/web3';

function RequestCard(props) {
    const [color, setColor] = useState('yellow');
    const [isManager, setIsManager] = useState(false);
    const [isApprover, setIsApprover] = useState(false);
    const [approveLoading, setApproveLoading] = useState(false);
    const [denyLoading, setDenyLoading] = useState(false);
    const [approverError, setApproverError] = useState('');
    const [finalizeLoading,setFinalizeLoading] = useState(false);
    const [managerError, setManagerError] = useState(false);
    const [approverDecided, setApproverDecided] = useState(false);
    const [majorityApproval, setMajorityApproval] = useState(false);

    const router = useRouter();
    const { address, index, request, approverCount } = props;

    useEffect(() => {
        async function getRoles() {
            const accounts = await web3.eth.getAccounts();
            const campaign = Campaign(address);
            const manager =  await campaign.methods.manager().call();
            const isApprover = await campaign.methods.approvers(accounts[0]).call();

            setIsManager(accounts[0] === manager);
            setIsApprover(isApprover);
        }
        getRoles();
    }, [address]);

    useEffect(() => {
        if (request.complete) {
            setColor('purple');
        }

        if (request.approvalCount / approverCount >= .5) {
            setMajorityApproval(true);
        }
    }, [
        request.complete,
        request.approvalCount,
        approverCount
    ]);

    const approveRequest = async (event) => {
        event.preventDefault();

        if(!isApprover) {
            alert(
                'You must first contribute to a campaign before you can vote on spending requests.'
            );
            return;
        }

        setApproveLoading(true);
        setApproverError('');

        const campaign = Campaign(address);

        try {
            const accounts = await web3.eth.getAccounts();

            await campaign.methods.approveRequest(index)
                .send({
                    from: accounts[0],
                    gas: '1000000'
                });

            setColor('green');
            setApproverDecided(true);

            router.replace(`/campaigns/${address}/requests`);
        } catch (err) {
            setApproverError(err.message);
        }

        setApproveLoading(false);
    };

    const denyRequest = async (event) => {
        event.preventDefault();

        if(!isApprover) {
            alert(
                'You must first contribute to a campaign before you can vote on spending requests.'
            );
            return;
        }

        setDenyLoading(true);
        setApproverError('');

        const campaign = Campaign(address);

        try {
            const accounts = await web3.eth.getAccounts();

            await campaign.methods.denyRequest(index).send({
                from: accounts[0],
                gas: '1000000'
            });
        } catch (err) {
            setApproverError(err.message);
        }

        setDenyLoading(false);
        setColor('red');
        setApproverDecided('true');
    }

    const finalizeRequest = async (event) => {
        event.preventDefault();

        if(!isManager) {
            alert(
                'You must be the campaign creator to approve spending requests.'
            );
            return;
        }

        setFinalizeLoading(true);
        setManagerError('');

        const campaign = Campaign(address);

        try {
            const accounts = await web3.eth.getAccounts();

            await campaign.methods.finalizeRequest(index)
                .send({
                    from: accounts[0],
                    gas: '1000000'
                });
            setColor('purple');

            router.replace(`/campaigns/${address}/requests`);
        } catch (err) {
            setManagerError(err.message);
        }
        setFinalizeLoading(false);
    }

    const { Content, Header, Description, Meta } = Card;

    let approverButtons, managerButtons;
    if (!request.complete && !approverDecided) {
        approverButtons =
            <Content>
                <Button
                    basic
                    color='green'
                    onClick={approveRequest}
                    loading={approveLoading}
                >
                    Approve
                </Button>

                <Button
                    basic
                    color='red'
                    floated='right'
                    onClick={denyRequest}
                    loading={denyLoading}
                >
                    Deny
                </Button>

                <Message
                    error
                    header='Oops!'
                    content={approverError}
                    hidden={!approverError}
                />
            </Content>;
    }

    if (!request.complete && majorityApproval) {
        managerButtons =
            <Content>
                <Button
                    basic
                    fluid
                    color='purple'
                    onClick={finalizeRequest}
                    loading={finalizeLoading}
                >
                    Finalize Request
                </Button>

                <Message
                    error
                    header='Oops!'
                    content={managerError}
                    hidden={!managerError}
                />
            </Content>
    }

    return (
        <Card
            key={index}
            style={{ overflowWrap: 'break-word' }}
            color={color}
        >
            <Content>
                <Meta textAlign='right'>
                    Request #{index + 1}
                    {request.complete ? ' Completed' : ''}
                </Meta>

                <Description>
                    Request Amount:
                </Description>

                <Header>
                    {web3.utils.fromWei(request.value, 'ether')} Eth
                </Header>

                <Description >
                    Recipient Address:<br />
                    <a
                        href={`https://etherscan.io/address/${request.recipient}`}
                        target='_blank'
                        rel='noopener noreferrer'
                    >
                        {request.recipient}
                    </a>
                </Description><br />

                <Description>
                    Description:<br />
                    <b>{request.description}</b>
                </Description><br />

                <Description>
                    Approvals:<br />
                    <b>{request.approvalCount}/{approverCount}</b>
                </Description>
            </Content>
            {approverButtons}
            {managerButtons}
        </Card>
    );
}

export default RequestCard;