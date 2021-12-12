// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CampaignFactory {
    Campaign[] public deployedCampaigns;

    function createCampaign(
        uint256 minimum,
        string memory name,
        string memory description,
        string memory image,
        uint256 target
    ) public {
        Campaign newCampaign = new Campaign(
            minimum,
            msg.sender,
            name,
            description,
            image,
            target
        );
        deployedCampaigns.push(newCampaign);
    }

    function getDeployedCampaigns() public view returns (Campaign[] memory) {
        return deployedCampaigns;
    }
}

contract Campaign {
    struct Request {
        string description;
        uint256 value;
        address recipient;
        bool complete;
        uint256 approvalCount;
        mapping(address => bool) approvals;
    }

    struct Contributor {
        address contributorAddress;
        uint256 value;
        //string transactionHash;
    }

    Request[] public requests;
    address public manager;
    uint256 public minimumContribution;
    string public CampaignName;
    string public CampaignDescription;
    string public imageUrl;
    uint256 public targetToAchieve;
    Contributor[] public contributors;
    mapping(address => bool) public approvers;
    uint256 public approversCount;
    uint256 public amount = 0;

    modifier restricted() {
        require(msg.sender == manager);
        _;
    }

    event Contributing(address contributor, uint256 amount);

    constructor(
        uint256 minimum,
        address creator,
        string memory name,
        string memory description,
        string memory image,
        uint256 target
    ) {
        manager = creator;
        minimumContribution = minimum;
        CampaignName = name;
        CampaignDescription = description;
        imageUrl = image;
        targetToAchieve = target;
    }

    function contribute() public payable {
        require(msg.value >= minimumContribution);
        approvers[msg.sender] = true;
        uint256 i = 0;
        Contributor memory contributor = Contributor({
            contributorAddress: msg.sender,
            value: msg.value
        });
        contributors.push(contributor);
        uint256 no = contributors.length;
        for (i; i < no; i += 1) {
            if (msg.sender == contributors[i].contributorAddress) {
                approversCount++;
            }
        }
        
    }

    function viewContributor() public view returns (Contributor[] memory) {
        return contributors;
    }

    uint256 public numRequests;

    function viewRequest() public view returns (uint256) {
        return numRequests;
    }

    function createRequest(
        string memory description,
        uint256 value,
        address recipient
    ) public restricted {
        requests.push();
        Request storage r = requests[numRequests];
        r.description = description;
        r.value = value;
        r.recipient = recipient;
        r.complete = false;
        r.approvalCount = 0;
        numRequests += 1;
    }

    function approveRequest(uint256 index) public {
        require(approvers[msg.sender]);
        require(!requests[index].approvals[msg.sender]);
        requests[index].approvals[msg.sender] = true;
        requests[index].approvalCount++;
    }

    function finalizeRequest(uint256 index) public restricted {
        require(requests[index].approvalCount >= (approversCount / 2));
        require(!requests[index].complete);
        address payable rec = payable(requests[index].recipient);
        rec.transfer(requests[index].value);
        requests[index].complete = true;
    }

    function getSummary()
        public
        view
        returns (
            uint256,
            uint256,
            uint256,
            uint256,
            address,
            string memory,
            string memory,
            string memory,
            uint256,
            uint256
        )
    {
        return (
            minimumContribution,
            address(this).balance,
            requests.length,
            approversCount,
            manager,
            CampaignName,
            CampaignDescription,
            imageUrl,
            contributors.length,
            targetToAchieve
        );
    }

    function getRequestsCount() public view returns (uint256) {
        return requests.length;
    }

    function getContributorsCount() public view returns (uint256) {
        return contributors.length;
    }
}
