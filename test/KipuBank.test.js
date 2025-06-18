const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("KipuBank", function () {
  let kipuBank;
  let owner;
  let addr1;
  let addr2;
  
  const BANK_CAP = ethers.parseEther("100");
  const WITHDRAWAL_LIMIT = ethers.parseEther("1");

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    const KipuBank = await ethers.getContractFactory("KipuBank");
    kipuBank = await KipuBank.deploy(BANK_CAP, WITHDRAWAL_LIMIT);
    await kipuBank.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set correct values in constructor", async function () {
      expect(await kipuBank.BANK_CAP()).to.equal(BANK_CAP);
      expect(await kipuBank.WITHDRAWAL_LIMIT()).to.equal(WITHDRAWAL_LIMIT);
    });

    it("Should initialize state variables correctly", async function () {
      expect(await kipuBank.totalDeposits()).to.equal(0);
      expect(await kipuBank.totalWithdrawals()).to.equal(0);
      expect(await kipuBank.totalBalance()).to.equal(0);
    });
  });

  describe("Deposits", function () {
    it("Should allow valid deposits", async function () {
      const depositAmount = ethers.parseEther("1");
      
      await expect(kipuBank.connect(addr1).deposit({ value: depositAmount }))
        .to.emit(kipuBank, "Deposit")
        .withArgs(addr1.address, depositAmount, depositAmount);

      expect(await kipuBank.getVaultBalance(addr1.address)).to.equal(depositAmount);
      expect(await kipuBank.totalBalance()).to.equal(depositAmount);
      expect(await kipuBank.totalDeposits()).to.equal(1);
    });

    it("Should reject deposits of 0 ETH", async function () {
      await expect(kipuBank.connect(addr1).deposit({ value: 0 }))
        .to.be.revertedWithCustomError(kipuBank, "ZeroDepositNotAllowed");
    });

    it("Should reject deposits that exceed bank cap", async function () {
      const largeDeposit = ethers.parseEther("101");
      
      await expect(kipuBank.connect(addr1).deposit({ value: largeDeposit }))
        .to.be.revertedWithCustomError(kipuBank, "DepositExceedsBankCap");
    });

    it("Should allow multiple deposits from same user", async function () {
      const deposit1 = ethers.parseEther("1");
      const deposit2 = ethers.parseEther("2");
      
      await kipuBank.connect(addr1).deposit({ value: deposit1 });
      await kipuBank.connect(addr1).deposit({ value: deposit2 });

      expect(await kipuBank.getVaultBalance(addr1.address)).to.equal(deposit1 + deposit2);
      expect(await kipuBank.totalDeposits()).to.equal(2);
    });
  });

  describe("Withdrawals", function () {
    beforeEach(async function () {
      const depositAmount = ethers.parseEther("5");
      await kipuBank.connect(addr1).deposit({ value: depositAmount });
    });

    it("Should allow valid withdrawals", async function () {
      const withdrawAmount = ethers.parseEther("1");
      const initialBalance = await addr1.provider.getBalance(addr1.address);
      
      const tx = await kipuBank.connect(addr1).withdraw(withdrawAmount);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      await expect(tx)
        .to.emit(kipuBank, "Withdrawal")
        .withArgs(addr1.address, withdrawAmount, ethers.parseEther("4"));

      expect(await kipuBank.getVaultBalance(addr1.address)).to.equal(ethers.parseEther("4"));
      expect(await kipuBank.totalWithdrawals()).to.equal(1);
    });

    it("Should reject withdrawals of 0 ETH", async function () {
      await expect(kipuBank.connect(addr1).withdraw(0))
        .to.be.revertedWithCustomError(kipuBank, "ZeroWithdrawalNotAllowed");
    });

    it("Should reject withdrawals that exceed limit", async function () {
      const largeWithdraw = ethers.parseEther("2");
      
      await expect(kipuBank.connect(addr1).withdraw(largeWithdraw))
        .to.be.revertedWithCustomError(kipuBank, "WithdrawalExceedsLimit");
    });

    it("Should reject withdrawals without sufficient funds", async function () {
      const withdrawAmount = ethers.parseEther("10");
      
      await expect(kipuBank.connect(addr1).withdraw(withdrawAmount))
        .to.be.revertedWithCustomError(kipuBank, "InsufficientVaultBalance");
    });

    it("Should reject withdrawals from users without deposits", async function () {
      const withdrawAmount = ethers.parseEther("1");
      
      await expect(kipuBank.connect(addr2).withdraw(withdrawAmount))
        .to.be.revertedWithCustomError(kipuBank, "InsufficientVaultBalance");
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await kipuBank.connect(addr1).deposit({ value: ethers.parseEther("2") });
      await kipuBank.connect(addr2).deposit({ value: ethers.parseEther("3") });
      await kipuBank.connect(addr1).withdraw(ethers.parseEther("1"));
    });

    it("Should return correct vault balance", async function () {
      expect(await kipuBank.getVaultBalance(addr1.address)).to.equal(ethers.parseEther("1"));
      expect(await kipuBank.getVaultBalance(addr2.address)).to.equal(ethers.parseEther("3"));
    });

    it("Should return correct bank information", async function () {
      const bankInfo = await kipuBank.getBankInfo();
      
      expect(bankInfo[0]).to.equal(BANK_CAP); // bankCap
      expect(bankInfo[1]).to.equal(WITHDRAWAL_LIMIT); // withdrawalLimit
      expect(bankInfo[2]).to.equal(ethers.parseEther("4")); // currentBalance
      expect(bankInfo[3]).to.equal(2); // deposits
      expect(bankInfo[4]).to.equal(1); // withdrawals
    });
  });

  describe("Complex Scenarios", function () {
    it("Should handle multiple users correctly", async function () {
      // Multiple user deposits
      await kipuBank.connect(addr1).deposit({ value: ethers.parseEther("10") });
      await kipuBank.connect(addr2).deposit({ value: ethers.parseEther("20") });
      
      // Withdrawals
      await kipuBank.connect(addr1).withdraw(ethers.parseEther("1"));
      await kipuBank.connect(addr2).withdraw(ethers.parseEther("1"));
      
      // Verify balances
      expect(await kipuBank.getVaultBalance(addr1.address)).to.equal(ethers.parseEther("9"));
      expect(await kipuBank.getVaultBalance(addr2.address)).to.equal(ethers.parseEther("19"));
      expect(await kipuBank.totalBalance()).to.equal(ethers.parseEther("28"));
    });

    it("Should prevent deposits that take total over cap", async function () {
      // Deposit near limit
      await kipuBank.connect(addr1).deposit({ value: ethers.parseEther("99") });
      
      // Try to deposit more than remaining limit
      await expect(kipuBank.connect(addr2).deposit({ value: ethers.parseEther("2") }))
        .to.be.revertedWithCustomError(kipuBank, "DepositExceedsBankCap");
        
      // But should allow deposits within limit
      await expect(kipuBank.connect(addr2).deposit({ value: ethers.parseEther("1") }))
        .to.not.be.reverted;
    });
  });
}); 