const token = artifacts.require('Token');
const crowdSale = artifacts.require('TokenCrowdSale');

module.exports = (deployer, network, accounts) => {
  const wallet = accounts[0];

  deployer.deploy(token);
  token.deployed().then(instance => {
    deployer.deploy(crowdSale, wallet, instance.address);
  });
};
