pragma solidity ^0.4.17;

contract CampaignFactory {
    address[] campaigns;
    
    function createCampaign(uint minimum) public payable {
        address campaign = new Campaign(msg.sender, minimum);
        campaigns.push(campaign);
    }

    function getCampaigns() public view returns (address[]) {
        return campaigns;
    }
}

contract Campaign {
    struct Request {
        string description;
        uint value;
        address recipient;
        bool complete;
        uint approvalCount;
        mapping(address => bool) approvals;
    }

    address public manager;
    uint public minimumContribution;
    uint public approverCount;
    mapping(address => bool) public approvers;
    Request[] public requests;

    modifier restricted() {
        require(msg.sender == manager);
        _;
    }

    function Campaign (address creator, uint minimum) public {
        manager = creator;
        minimumContribution = minimum;
    }

    function contribute() public payable {
        require(msg.value >= minimumContribution);
        if(approvers[msg.sender] != true) {
            approvers[msg.sender] = true;
            approverCount++;
        }
    }

    function createRequest(string description, uint value, address recipient) public restricted {
        Request memory request = Request({
            description: description,
            value: value,
            recipient: recipient,
            complete: false,
            approvalCount: 0
        });
        
        requests.push(request);
    }

// Any way to abuse approveRequest, denyRequest, or finalizeRequest after request is complete?
// Would adding require(!request[index].complete) add unnecessary gas?
    function approveRequest(uint index) public {
        require(approvers[msg.sender]);

        // Is this assignment worth the gas?
        Request storage request = requests[index];
        require(!request.approvals[msg.sender]);
        
        request.approvals[msg.sender] = true;
        request.approvalCount++;
    }

    function denyRequest(uint index) public {
        // Is 'require(requests[index].approvals[msg.sender]);' better than the 'if' below?
        // Does the 'if' result in the function call succeeding even if the 'if' fails? - Yes, useless tx.
        // Is that preferrable behavior than it failing if it's already false?
        // Which is better for gas? Security?
        if(requests[index].approvals[msg.sender] == true) {
            requests[index].approvals[msg.sender] = false;
            requests[index].approvalCount--;
        }
    }

    function finalizeRequest(uint index) public restricted {
        Request storage request = requests[index];
        
        require(!request.complete);
        require(request.approvalCount > approverCount/2);
        
        request.complete = true;
        request.recipient.transfer(request.value);
    }

    function getMetrics() public view returns (
        uint, uint, uint, uint, address
    ) {
        return (
            minimumContribution,
            this.balance,
            requests.length,
            approverCount,
            manager
        );
    }

    function getRequestsCount() public view returns (uint) {
        return requests.length;
    }
}
