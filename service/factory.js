import web3 from "./web3";
import CampaignFactory from "../artifacts/contracts/Campaign.sol/CampaignFactory.json";


const instance = new web3.eth.Contract(
  CampaignFactory.abi,
  "0x6fBc74b5ac5E2B6Da40E0A6f2814f5757A815091"
);

export default instance;

