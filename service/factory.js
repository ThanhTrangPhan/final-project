import web3 from "./web3";
import CampaignFactory from "../artifacts/contracts/Campaign.sol/CampaignFactory.json";


const instance = new web3.eth.Contract(
  CampaignFactory.abi,
  "0x082a2197aB21E9CeAB43f64027041FCC2677BB81"
);

export default instance;

