// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title ProfitSharingToken (PFT)
/// @notice ERC20 token representing profit-sharing rights
contract ProfitSharingToken is ERC20, Ownable {
    constructor(
        string memory name,
        string memory symbol,
        address initialOwner
    ) ERC20(name, symbol) Ownable(initialOwner) {}

    /// @notice Mint new tokens (only owner, i.e., MachineManager)
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /// @notice Burn tokens (if needed)
    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
    }
}

/// @title MachineManager
/// @notice Handles machine usage, rewards, airdrops, and revenue
contract MachineManager is Ownable {
    struct Machine {
        string name;
        address machineAddr;
        uint256 price; // in wei
        bool exists;
    }

    ProfitSharingToken public profitToken;
    uint256 public machineCount;
    uint256 public totalRevenue; // track real usage revenue

    mapping(uint256 => Machine) public machines;
    mapping(uint256 => mapping(address => bool)) public airdropClaimed;
    mapping(uint256 => mapping(address => uint256)) public userMachineEarnings; // NEW: track PFT earned per machine

    event MachineAdded(
        uint256 indexed machineId,
        string name,
        address machineAddr,
        uint256 price
    );
    event MachineUsed(address indexed user, uint256 machineId, uint256 price, uint256 mintedPFT);
    event AirdropClaimed(
        address indexed user,
        uint256 indexed machineId,
        uint256 machinePrice,
        uint256 gasAmount
    );

    constructor() Ownable(msg.sender) {
        // Deploy ProfitSharingToken and transfer ownership to this contract
        profitToken = new ProfitSharingToken(
            "Profit Sharing Token",
            "PFT",
            address(this)
        );
    }

    /// @notice Add a new machine (admin only)
    function addMachine(
        string calldata name,
        address machineAddr,
        uint256 price
    ) external onlyOwner {
        machines[machineCount] = Machine({
            name: name,
            machineAddr: machineAddr,
            price: price,
            exists: true
        });
        emit MachineAdded(machineCount, name, machineAddr, price);
        machineCount++;
    }

    /// @notice User pays to use a machine → gets profit-sharing tokens
    function useMachine(uint256 machineId) external payable {
        Machine memory m = machines[machineId];
        require(m.exists, "Invalid machine");
        require(msg.value >= m.price, "Insufficient payment");

        // Count machine payment as revenue
        totalRevenue += msg.value;

        // Mint PFT: 100 PFT per 1 native token (1e18 wei = 1 token unit)
        uint256 minted = (msg.value * 100);
        profitToken.mint(msg.sender, minted); // ERC20 has 18 decimals by default

        // Track how much user earned from this machine
        userMachineEarnings[machineId][msg.sender] += minted;

        emit MachineUsed(msg.sender, machineId, msg.value, minted);
    }

    /// @notice One-time native token airdrop per user per machine
    function airdrop(address user, uint256 machineId) external onlyOwner {
        require(machines[machineId].exists, "Invalid machine");
        require(!airdropClaimed[machineId][user], "Already claimed");

        uint256 gasAmount = estimateGasAmount();
        uint256 totalAmount = machines[machineId].price + gasAmount;

        require(address(this).balance >= totalAmount, "Insufficient balance");

        payable(user).transfer(totalAmount);

        airdropClaimed[machineId][user] = true;

        emit AirdropClaimed(user, machineId, machines[machineId].price, gasAmount);
    }

    /// @notice Estimate gas amount for useMachine
    function estimateGasAmount() public view returns (uint256) {
    uint256 gasLimit = 200000;
    uint256 gasPrice = tx.gasprice; // Current transaction gas price
    return gasLimit * gasPrice;
}

    /// @notice Admin can withdraw collected ether
    function withdraw(address payable to, uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Insufficient balance");
        to.transfer(amount);
    }

    /// @notice Get all machines as an array
    function getAllMachines() external view returns (Machine[] memory) {
        Machine[] memory list = new Machine[](machineCount);
        for (uint256 i = 0; i < machineCount; i++) {
            list[i] = machines[i];
        }
        return list;
    }

    /// @notice Get all PFT earnings for a user across all machines
    function getUserEarnings(address user) external view returns (uint256[] memory) {
        uint256[] memory earnings = new uint256[](machineCount);
        for (uint256 i = 0; i < machineCount; i++) {
            earnings[i] = userMachineEarnings[i][user];
        }
        return earnings;
    }

    /// @notice Receive Ether
    receive() external payable {}
}
