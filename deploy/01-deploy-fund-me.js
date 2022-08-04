/*module.exports = async (hre) => {
  const { getNamedAccounts, deployments } = hre;
};
*/

const {
  networkConfig,
  developmentChains,
} = require("../helper-hardhat-config");
const { getNamedAccounts, deployments, network } = require("hardhat");
const { verify } = require("../utils/verify");
//const helperConfig = require("../helper-hardhat-config");
//const networkConfig= helperConfig.networkConfig
module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  //If chainID X, address Y
  //If chainID Z ,address W

  //const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
  let ethUsdPriceFeedAddress;

  if (developmentChains.includes(network.name)) {
    const ethUsdAggregator = await deployments.get("MockV3Aggregator");
    ethUsdPriceFeedAddress = ethUsdAggregator.address;
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
  }

  log("Deploying FundMe and waiting for confirmations...");
  log("----------------------------------------------------");

  // if the contract doesn't exist, we deploy a minimal version of
  // for our local testing

  //well what happens when we want to change chains
  // when going for local host or hardhat network we want to use a mock
  const args = [ethUsdPriceFeedAddress];
  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: args, // put price feed address
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(fundMe.address, args);
  }
  log("------------------");
};
module.exports.tags = ["all", "fundme"];
