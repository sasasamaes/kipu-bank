const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying KipuBank...");

  // Get the account that will deploy the contract
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Get deployer balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  // Constructor parameters
  const BANK_CAP = ethers.parseEther("100"); // 100 ETH bank limit
  const WITHDRAWAL_LIMIT = ethers.parseEther("1"); // 1 ETH withdrawal limit

  // Get contract factory
  const KipuBank = await ethers.getContractFactory("KipuBank");

  // Deploy contract
  const kipuBank = await KipuBank.deploy(BANK_CAP, WITHDRAWAL_LIMIT);
  await kipuBank.waitForDeployment();

  const contractAddress = await kipuBank.getAddress();
  console.log("KipuBank deployed at:", contractAddress);

  // Show contract information
  console.log("\n--- Contract Information ---");
  console.log("Bank Cap:", ethers.formatEther(await kipuBank.BANK_CAP()), "ETH");
  console.log("Withdrawal Limit:", ethers.formatEther(await kipuBank.WITHDRAWAL_LIMIT()), "ETH");

  // Save deployment information
  const deploymentInfo = {
    contractAddress: contractAddress,
    deployer: deployer.address,
    bankCap: ethers.formatEther(BANK_CAP),
    withdrawalLimit: ethers.formatEther(WITHDRAWAL_LIMIT),
    network: await deployer.provider.getNetwork(),
    blockNumber: await deployer.provider.getBlockNumber(),
    timestamp: new Date().toISOString()
  };

  console.log("\n--- Deployment Information ---");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Verification instructions
  console.log("\n--- Etherscan Verification ---");
  console.log("To verify the contract, run:");
  const network = await deployer.provider.getNetwork();
  console.log(`npx hardhat verify --network ${network.name} ${contractAddress} "${BANK_CAP}" "${WITHDRAWAL_LIMIT}"`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 