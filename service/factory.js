import web3 from "./web3";
import CampaignFactory from "../artifacts/contracts/Campaign.sol/CampaignFactory.json";


const instance = new web3.eth.Contract(
  CampaignFactory.abi,
  "0x5eC3c348da7e68aDf93297A370E86911E234221a"
);

export default instance;

