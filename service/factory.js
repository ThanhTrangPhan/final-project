import web3 from "./web3";
import CampaignFactory from "../artifacts/contracts/Campaign.sol/CampaignFactory.json";


const instance = new web3.eth.Contract(
  CampaignFactory.abi,
  "0x87C37965364ABFfeA22b63cBfd3049354d2AB62c"
);

export default instance;

