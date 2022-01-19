import web3 from "./web3";
import CampaignFactory from "../artifacts/contracts/Campaign.sol/CampaignFactory.json";


const instance = new web3.eth.Contract(
  CampaignFactory.abi,
  "0xD570Dc0c84d6A08d15d319A68Ff05109d9B1810B"
);

export default instance;

