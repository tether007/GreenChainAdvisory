const CropAdvisor = artifacts.require("CropAdvisor");

module.exports = function (deployer) {
  deployer.deploy(CropAdvisor);
};