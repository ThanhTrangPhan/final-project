import web3 from "./web3";
import CampaignFactory from "../artifacts/contracts/Campaign.sol/CampaignFactory.json";


const instance = new web3.eth.Contract(
  CampaignFactory.abi,
  "0xCb1A04f5B0BcedA3a9AA7BcA433469757Ff88754"
);

export default instance;

