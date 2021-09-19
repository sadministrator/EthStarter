import React, { useEffect, useState } from 'react';
import { Card, Button, Message } from 'semantic-ui-react';
import { useRouter } from 'next/router';

import Campaign from '../ethereum/campaign';
import web3 from '../ethereum/web3';

function RequestCard(props) {
    const [color, setColor] = useState('yellow');
    const [isManager, setIsManager] = useState(false);
    const [isApprover, setIsApprover] = useState(false);
    const [approverLoading, setApproverLoading] = useState(false);
    const [approverError, setApproverError] = useState('');
    const [finalizeLoading,setFinalizeLoading] = useState(false);
    const [managerError, setManagerError] = useState(false);
    const [majorityApproval, setMajorityApproval] = useState(false);
    const [hasApproved, setHasApproved] = useState(false);

    const router = useRouter();
    const { address, index, request, approverCount } = props;

    useEffect(() => {
        async function getRoles() {
            const accounts = await web3.eth.getAccounts();
            const campaign = Campaign(address);
            const manager =  await campaign.methods.manager().call();
            const isApprover = await campaign.methods.approvers(accounts[0]).call();
            const hasApproved = await campaign.methods.isApprover(index, accounts[0]).call();

            setIsManager(accounts[0] === manager);
            setIsApprover(isApprover);
            setHasApproved(hasApproved);
        }

        getRoles();
    });

    useEffect(() => {
        if (request.complete) {
            setColor('purple');
        } else if (hasApproved) {
            setColor('green');
        }

        if (request.approvalCount / approverCount >= .5) {
            setMajorityApproval(true);
        }
    }, [
        request.complete,
        request.approvalCount,
        approverCount,
        hasApproved
    ]);

    const approveRequest = async (event) => {
        event.preventDefault();

        setApproverLoading(true);
        setApproverError('');

        const campaign = Campaign(address);

        try {
            const accounts = await web3.eth.getAccounts();

            await campaign.methods.approveRequest(index)
                .send({
                    from: accounts[0],
                    gas: '1000000'
                });

            router.replace(`/campaigns/${address}/requests`);
        } catch (err) {
            setApproverError(err.message);
        }

        setApproverLoading(false);
        setColor('green');
    };

    const revokeApproval = async (event) => {
        event.preventDefault();

        setApproverLoading(true);
        setApproverError('');

        const campaign = Campaign(address);

        try {
            const accounts = await web3.eth.getAccounts();

            await campaign.methods.revokeApproval(index).send({
                from: accounts[0],
                gas: '1000000'
            });
        } catch (err) {
            setApproverError(err.message);
        }

        setApproverLoading(false);
        setColor('red');
    }

    const finalizeRequest = async (event) => {
        event.preventDefault();

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

            router.replace(`/campaigns/${address}/requests`);
        } catch (err) {
            setManagerError(err.message);
        }
        setFinalizeLoading(false);
        setColor('purple');
    }

    const { Content, Header, Description, Meta } = Card;

    let approverButton, buttonColor, buttonText, buttonHandler;
    if (isApprover && !request.complete) {
        if(hasApproved) {
            buttonColor = 'red';
            buttonText = 'Revoke Approval';
            buttonHandler = revokeApproval;
        } else {
            buttonColor = 'green';
            buttonText = 'Approve Request';
            buttonHandler = approveRequest;
        }

        approverButton =
                <Content>
                    <Button
                        fluid='true'
                        basic
                        color={buttonColor}
                        onClick={buttonHandler}
                        loading={approverLoading}
                    >
                        {buttonText}
                    </Button>

                    <Message
                    error
                    header='Oops!'
                    content={approverError}
                    hidden={!approverError}
                />
                </Content>;
    }

    let managerButton;
    if (isManager && !request.complete && majorityApproval) {
        managerButton =
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
            {approverButton}
            {managerButton}
        </Card>
    );
}

export default RequestCard;