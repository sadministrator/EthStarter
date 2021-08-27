import React, { Component } from 'react';
import { Card, Button, Message } from 'semantic-ui-react';
import Campaign from '../ethereum/campaign';
import web3 from '../ethereum/web3';
import { Router } from '../routes';


class RequestCard extends Component {
    state = {
        color: 'yellow',
        isManager: true,
        isApprover: true,
        approveLoading: false,
        approverError: '',
        finalizeLoading: false,
        managerError: false,
        approverDecided: false,
        majorityApproval: false
    }

    constructor(props) {
        super(props);

        const { request, approverCount } = this.props;

        if (request.complete) {
            this.state.color = 'purple'
        }

        if (request.approvalCount / approverCount >= .5) {
            this.state.majorityApproval = true;
        }
    }

    approveRequest = async (event) => {
        event.preventDefault();

        this.setState({
            approveLoading: true,
            approverError: ''
        });

        const campaign = Campaign(this.props.address);

        try {
            const accounts = await web3.eth.getAccounts();

            await campaign.methods.approveRequest(this.props.index)
                .send({
                    from: accounts[0],
                    gas: '1000000'
                });

            this.setState({
                color: 'green',
                approverDecided: true
            });

            Router.replaceRoute(`/campaigns/${this.props.address}/requests`);
        } catch (err) {
            this.setState({ approverError: err.message });
        }

        this.setState({ approveLoading: false });
    };

    denyRequest = (event) => {
        event.preventDefault();

        this.setState({
            color: 'red',
            approverDecided: 'true'
        });
    }

    finalizeRequest = async (event) => {
        event.preventDefault();

        this.setState({
            finalizeLoading: true,
            managerError: ''
        });

        const campaign = Campaign(this.props.address);

        try {
            const accounts = await web3.eth.getAccounts();

            campaign.methods.finalizeRequest(this.props.index)
                .send({
                    from: accounts[0],
                    gas: '1000000'
                });
            this.setState({ color: 'purple' });

            Router.replaceRoute(`/campaigns/${this.props.address}/requests`);
        } catch (err) {
            this.setState({ managerError: err.message });
        }
        this.setState({ finalizeLoading: false });
    }

    render() {
        const { index, request, approverCount } = this.props;
        const { Content, Header, Description, Meta } = Card;

        let approverButtons, managerButtons;
        if (this.state.isApprover &&
            !this.props.request.complete &&
            !this.state.approverDecided) {
            approverButtons =
                <Content>
                    <Button
                        basic
                        color='green'
                        onClick={this.approveRequest}
                        loading={this.state.approveLoading}
                    >
                        Approve
                    </Button>

                    <Button
                        basic
                        color='red'
                        floated='right'
                        onClick={this.denyRequest}
                    >
                        Deny
                    </Button>

                    <Message
                        error
                        header='Oops!'
                        content={this.state.approverError}
                        hidden={!this.state.approverError}
                    />
                </Content>;
        }

        if (this.state.isManager &&
            !this.props.request.complete &&
            this.state.majorityApproval) {
            managerButtons =
                <Content>
                    <Button
                        basic
                        fluid
                        color='purple'
                        onClick={this.finalizeRequest}
                        loading={this.state.finalizeLoading}
                    >
                        Finalize Request
                    </Button>

                    <Message
                        error
                        header='Oops!'
                        content={this.state.managerError}
                        hidden={!this.state.managerError}
                    />
                </Content>
        }

        return (
            <Card
                key={index}
                style={{ overflowWrap: 'break-word' }}
                color={this.state.color}
            >
                <Content>
                    <Meta textAlign='right'>
                        Request #{index + 1}
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
        )
    }
}

export default RequestCard;