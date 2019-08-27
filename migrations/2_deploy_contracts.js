const token = artifacts.require('Token');
const crowdSale = artifacts.require('TokenCrowdSale');

module.exports = function(deployer, network, accounts) {
  const wallet = accounts[0];

  deployer.deploy(token).then(() => {
    return deployer.deploy(crowdSale, wallet, token.address);
  });
};
