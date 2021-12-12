import web3 from "./web3";
import CampaignFactory from "../artifacts/contracts/Campaign.sol/CampaignFactory.json";


const instance = new web3.eth.Contract(
  CampaignFactory.abi,
  "0x567F9ACB5EFa8C4dE87eF7f1194F757EaA3b19DC"
);

export default instance;

