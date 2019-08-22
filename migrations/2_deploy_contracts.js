const token = artifacts.require('Token');

module.exports = deployer => {
  deployer.deploy(token);
}