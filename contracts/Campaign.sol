// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";
contract CampaignFactory {
    Campaign[] public deployedCampaigns;

    function createCampaign(uint minimum,string memory name,string memory  description,string memory  image,uint target) public {
        Campaign newCampaign = new Campaign(minimum, msg.sender,name,description,image,target);
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
      address payable recipient;
      bool complete;
      uint approvalCount;
      mapping(address => bool) approvals;
  }

  Request[] public requests;
  address public manager;
  uint public minimunContribution;
  string public CampaignName;
  string public CampaignDescription;
  string public imageUrl;
  uint public targetToAchieve;
  address[] public contributers;
  mapping(address => bool) public approvers;
  uint public approversCount;


  modifier restricted() {
      require(msg.sender == manager);
      _;
  }

  constructor(uint minimum, address creator,string memory  name,string memory  description,string memory  image,uint target) {
      manager = creator;
      minimunContribution = minimum;
      CampaignName=name;
      CampaignDescription=description;
      imageUrl=image;
      targetToAchieve=target;
  }

  function contribute() public payable {
      require(msg.value > minimunContribution );

      contributers.push(msg.sender);
      approvers[msg.sender] = true;
      approversCount++;
  }

uint numRequests;
  function createRequest(string memory  description, uint value, address payable recipient) public restricted {
      Request storage r = requests[numRequests++];
                r.description = description;
                r.value = value;
                r.recipient = recipient;
                r.complete = false;
                r.approvalCount = 0;

  }

  function approveRequest(uint index) public {
      require(approvers[msg.sender]);
      require(!requests[index].approvals[msg.sender]);

      requests[index].approvals[msg.sender] = true;
      requests[index].approvalCount++;
  }

  function finalizeRequest(uint index) public restricted{
      require(requests[index].approvalCount > (approversCount / 2));
      require(!requests[index].complete);

      requests[index].recipient.transfer(requests[index].value);
      requests[index].complete = true;

  }


    function getSummary() public view returns (uint,uint,uint,uint,address,string memory ,string memory ,string memory ,uint) {
        return(
            minimunContribution,
            address(this).balance,
            requests.length,
            approversCount,
            manager,
            CampaignName,
            CampaignDescription,
            imageUrl,
            targetToAchieve
          );
    }

    function getRequestsCount() public view returns (uint){
        return requests.length;
    }
}