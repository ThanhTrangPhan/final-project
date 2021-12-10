// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";

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
        uint value;
        address recipient;
        bool complete;
        uint256 approvalCount;
        mapping(address => bool) approvals;
    }

    Request[] public requests;
    address public manager;
    uint256 public minimunContribution;
    string public CampaignName;
    string public CampaignDescription;
    string public imageUrl;
    uint256 public targetToAchieve;
    address[] public contributers;
    mapping(address => bool) public approvers;
    uint256 public approversCount;
    uint256 public amount=0; 

    modifier restricted() {
        require(msg.sender == manager);
        _;
    }

    constructor(
        uint256 minimum,
        address creator,
        string memory name,
        string memory description,
        string memory image,
        uint256 target
    ) {
        manager = creator;
        minimunContribution = minimum;
        CampaignName = name;
        CampaignDescription = description;
        imageUrl = image;
        targetToAchieve = target;
    }

    function contribute() public payable {
        require(msg.value > minimunContribution);
        contributers.push(msg.sender);
        approvers[msg.sender] = true;
        approversCount++;
    }

    uint256 public numRequests ;
    
    function viewRequest() public view returns (uint256){
        return numRequests;
    }
    function createRequest(
        string memory description,
        uint value,
        address  recipient
    ) public restricted {
        requests.push();
        Request storage r = requests[numRequests];
        r.description = description;
        r.value = value;
        r.recipient = recipient;
        r.complete = false;
        r.approvalCount = 0;
        numRequests+=1;
        // Request memory req =  Request({
        //     description:description,
        //     value:value,
        //     recipient:recipient,
        //     complete:false,
        //     approvalCount:0
        // });
        
    }

    function approveRequest(uint256 index) public {
        require(approvers[msg.sender]);
        require(!requests[index].approvals[msg.sender]);
        requests[index].approvals[msg.sender] = true;
        requests[index].approvalCount++;
    }

    function finalizeRequest(uint256 index) public restricted {
        require(requests[index].approvalCount > (approversCount / 2));
        require(!requests[index].complete);
        address payable rec= payable (requests[index].recipient);
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
            minimunContribution,
            address(this).balance,
            requests.length,
            approversCount,
            manager,
            CampaignName,
            CampaignDescription,
            imageUrl,
            targetToAchieve,
            address(this).balance
        );
    }

    function getRequestsCount() public view returns (uint256) {
        return requests.length;
    }
}