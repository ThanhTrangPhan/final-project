require("@nomiclabs/hardhat-waffle");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

 const fs = require('fs')
 const privateKey = fs.readFileSync(".secret").toString().trim() || "01234567890123456789"
 
 module.exports = {
   defaultNetwork: "rinkeby",
   networks: {
     hardhat: {
       chainId: 1337
     },
     rinkeby: {
       url: 'https://rinkeby.infura.io/v3/83b57356a6be4e3e99890c21874b8d72',
       accounts: [privateKey]
     }
   },
   solidity: {
     version: "0.8.0",
     settings: {
       optimizer: {
         enabled: true,
         runs: 200
       }
     }
   }
 }
