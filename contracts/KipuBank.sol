// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title KipuBank
 * @author Francisco Campos
 * @notice A personal vault contract that allows users to deposit and withdraw ETH
 * @dev Implements a vault system with withdrawal limits and global deposit cap
 */
contract KipuBank {
    /*//////////////////////////////////////////////////////////////
                                VARIABLES
    //////////////////////////////////////////////////////////////*/
    
    /// @notice Maximum ETH limit that the bank can contain
    /// @dev Immutable variable set in constructor
    uint256 public immutable BANK_CAP;
    
    /// @notice Maximum withdrawal limit per transaction
    /// @dev Immutable variable for enhanced security
    uint256 public immutable WITHDRAWAL_LIMIT;
    
    /// @notice Contract owner address
    address public constant OWNER = 0x1234567890123456789012345678901234567890; // Change to your address
    
    /// @notice Mapping of user addresses to their vault balances
    mapping(address => uint256) private userVaults;
    
    /// @notice Total number of deposits made
    uint256 public totalDeposits;
    
    /// @notice Total number of withdrawals made
    uint256 public totalWithdrawals;
    
    /// @notice Total contract balance
    uint256 public totalBalance;

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/
    
    /// @notice Emitted when a user makes a deposit
    /// @param user Address of the user making the deposit
    /// @param amount Amount deposited in wei
    /// @param newVaultBalance New vault balance of the user
    event Deposit(address indexed user, uint256 amount, uint256 newVaultBalance);
    
    /// @notice Emitted when a user makes a withdrawal
    /// @param user Address of the user making the withdrawal
    /// @param amount Amount withdrawn in wei
    /// @param remainingVaultBalance Remaining vault balance of the user
    event Withdrawal(address indexed user, uint256 amount, uint256 remainingVaultBalance);

    /*//////////////////////////////////////////////////////////////
                           CUSTOM ERRORS
    //////////////////////////////////////////////////////////////*/
    
    /// @notice Error when deposit exceeds bank limit
    error DepositExceedsBankCap();
    
    /// @notice Error when user attempts to deposit 0 ETH
    error ZeroDepositNotAllowed();
    
    /// @notice Error when user doesn't have sufficient funds to withdraw
    error InsufficientVaultBalance();
    
    /// @notice Error when withdrawal exceeds per-transaction limit
    error WithdrawalExceedsLimit();
    
    /// @notice Error when user attempts to withdraw 0 ETH
    error ZeroWithdrawalNotAllowed();
    
    /// @notice Error when ETH transfer fails
    error TransferFailed();

    /*//////////////////////////////////////////////////////////////
                              MODIFIERS
    //////////////////////////////////////////////////////////////*/
    
    /// @notice Verifies that the amount is not zero
    /// @param amount Amount to verify
    modifier nonZeroAmount(uint256 amount) {
        if (amount == 0) {
            revert ZeroDepositNotAllowed();
        }
        _;
    }

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/
    
    /// @notice Constructor that sets the bank limits
    /// @param _bankCap Maximum ETH limit that the bank can contain
    /// @param _withdrawalLimit Maximum withdrawal limit per transaction
    constructor(uint256 _bankCap, uint256 _withdrawalLimit) {
        BANK_CAP = _bankCap;
        WITHDRAWAL_LIMIT = _withdrawalLimit;
    }

    /*//////////////////////////////////////////////////////////////
                           EXTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    
    /// @notice Allows users to deposit ETH in their personal vault
    /// @dev Payable function that accepts ETH and stores it in the user's vault
    function deposit() external payable nonZeroAmount(msg.value) {
        // Checks: Verify that deposit doesn't exceed bank limit
        if (totalBalance + msg.value > BANK_CAP) {
            revert DepositExceedsBankCap();
        }
        
        // Effects: Update state before external interactions
        userVaults[msg.sender] += msg.value;
        totalBalance += msg.value;
        totalDeposits++;
        
        // Interactions: Emit event
        emit Deposit(msg.sender, msg.value, userVaults[msg.sender]);
    }
    
    /// @notice Allows users to withdraw ETH from their personal vault
    /// @param amount Amount of ETH to withdraw in wei
    function withdraw(uint256 amount) external {
        // Checks: Input validations
        if (amount == 0) {
            revert ZeroWithdrawalNotAllowed();
        }
        
        if (amount > WITHDRAWAL_LIMIT) {
            revert WithdrawalExceedsLimit();
        }
        
        if (userVaults[msg.sender] < amount) {
            revert InsufficientVaultBalance();
        }
        
        // Effects: Update state before external interactions
        userVaults[msg.sender] -= amount;
        totalBalance -= amount;
        totalWithdrawals++;
        
        // Interactions: Transfer ETH to user
        _safeTransfer(msg.sender, amount);
        
        emit Withdrawal(msg.sender, amount, userVaults[msg.sender]);
    }
    
    /// @notice Gets the vault balance of a user
    /// @param user User address
    /// @return User's vault balance in wei
    function getVaultBalance(address user) external view returns (uint256) {
        return userVaults[user];
    }
    
    /// @notice Gets general bank information
    /// @return bankCap Maximum bank limit
    /// @return withdrawalLimit Withdrawal limit per transaction
    /// @return currentBalance Current bank balance
    /// @return deposits Total number of deposits
    /// @return withdrawals Total number of withdrawals
    function getBankInfo() external view returns (
        uint256 bankCap,
        uint256 withdrawalLimit, 
        uint256 currentBalance,
        uint256 deposits,
        uint256 withdrawals
    ) {
        return (
            BANK_CAP,
            WITHDRAWAL_LIMIT,
            totalBalance,
            totalDeposits,
            totalWithdrawals
        );
    }

    /*//////////////////////////////////////////////////////////////
                           PRIVATE FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    
    /// @notice Transfers ETH safely
    /// @param to Destination address
    /// @param amount Amount to transfer
    /// @dev Uses call to transfer ETH safely
    function _safeTransfer(address to, uint256 amount) private {
        (bool success, ) = payable(to).call{value: amount}("");
        if (!success) {
            revert TransferFailed();
        }
    }
} 