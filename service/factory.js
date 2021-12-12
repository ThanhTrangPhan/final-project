import web3 from "./web3";
import CampaignFactory from "../artifacts/contracts/Campaign.sol/CampaignFactory.json";


const instance = new web3.eth.Contract(
  CampaignFactory.abi,
  "0xD2dE23206ac9F8160734754600051e2B3b60d3D1"
);

export default instance;

