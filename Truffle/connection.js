const Web3 = require('web3');
const HDWalletProvider = require('@truffle/hdwallet-provider');
MNEMONIC = "pitch pass upset grief vapor pretty sunset repeat august treat assist dad";

const provider = new HDWalletProvider(
    MNEMONIC,
  `https://data-seed-prebsc-1-s1.binance.org:8545`
);

const web3 = new Web3(provider);

web3.eth.getBlockNumber()
  .then(latestBlock => {
    console.log('Latest Block:', latestBlock);
  })
  .catch(error => {
    console.error('Error connecting:', error);
  });

web3.eth.getBalance('0xb25cf2a7198a2c15c86badbda0c115a97a635100')
  .then(balance => {
    console.log('Balance:', web3.utils.fromWei(balance, 'ether'), 'BNB');
  })
  .catch(error => {
    console.error('Error connecting:', error);
  });