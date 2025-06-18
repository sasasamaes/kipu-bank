const { ethers } = require("hardhat");

async function main() {
  // Deployed contract address (update with real address)
  const CONTRACT_ADDRESS = "0x..."; // Replace with real address
  
  if (CONTRACT_ADDRESS === "0x...") {
    console.log("❌ Please update CONTRACT_ADDRESS with the real contract address");
    return;
  }

  const [signer] = await ethers.getSigners();
  console.log("🔗 Connecting with account:", signer.address);

  // Connect to contract
  const kipuBank = await ethers.getContractAt("KipuBank", CONTRACT_ADDRESS);
  console.log("✅ Connected to KipuBank contract at:", CONTRACT_ADDRESS);

  try {
    // Get bank information
    console.log("\n📊 Bank Information:");
    const bankInfo = await kipuBank.getBankInfo();
    console.log("   Bank Cap:", ethers.formatEther(bankInfo[0]), "ETH");
    console.log("   Withdrawal Limit:", ethers.formatEther(bankInfo[1]), "ETH");
    console.log("   Current Balance:", ethers.formatEther(bankInfo[2]), "ETH");
    console.log("   Total Deposits:", bankInfo[3].toString());
    console.log("   Total Withdrawals:", bankInfo[4].toString());

    // Check user vault balance
    const userVault = await kipuBank.getVaultBalance(signer.address);
    console.log("\n💰 Your Vault Balance:", ethers.formatEther(userVault), "ETH");

    // Deposit example (commented for security)
    /*
    console.log("\n📥 Making deposit of 0.1 ETH...");
    const depositTx = await kipuBank.deposit({ 
      value: ethers.parseEther("0.1") 
    });
    await depositTx.wait();
    console.log("✅ Deposit completed!");
    */

    // Withdrawal example (commented for security)
    /*
    if (userVault > 0) {
      console.log("\n📤 Making withdrawal of 0.05 ETH...");
      const withdrawTx = await kipuBank.withdraw(ethers.parseEther("0.05"));
      await withdrawTx.wait();
      console.log("✅ Withdrawal completed!");
    }
    */

    console.log("\n✨ Interaction completed successfully!");

  } catch (error) {
    console.error("❌ Error during interaction:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 