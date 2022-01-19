import Web3 from "web3";

const provider ={
  moonbase:'https://rpc.testnet.moonbeam.network' , 
}

const web3 = new Web3(provider.moonbase);

export default web3;