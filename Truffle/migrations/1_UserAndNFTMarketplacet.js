const UserAndNFTMarketplace = artifacts.require("UserAndNFTMarketplace");


module.exports = function(deployer) {
  deployer.deploy(UserAndNFTMarketplace);
  // deployer.deploy(UserAndNFTMarketplace, { gas: 6000000 });
};
