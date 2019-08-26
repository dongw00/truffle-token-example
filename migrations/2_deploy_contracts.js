const token = artifacts.require('Token');
const crowdSale = artifacts.require('TokenCrowdSale');

module.exports = (deployer, network, accounts) => {
  const wallet = accounts[1];

  deployer.deploy(token);
  token.deployed().then(async instance => {
    await deployer.deploy(crowdSale, wallet, instance.address);

    crowdSale.deployed().then(async crowd => {
      await instance.addMinter(crowd.address);
      await this.token.renounceMinter();
    });
  });
};
