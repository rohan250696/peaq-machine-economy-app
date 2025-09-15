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
/// @notice Handles machine usage + rewards in PFT
contract MachineManager is Ownable {
    struct Machine {
        string name;
        address machineAddr;
        uint256 price; // in wei
        bool exists;
    }

    ProfitSharingToken public profitToken;
    uint256 public machineCount;

    mapping(uint256 => Machine) public machines;
    mapping(uint256 => mapping(address => bool)) public userUsedMachine;

    event MachineAdded(
        uint256 indexed machineId,
        string name,
        address machineAddr,
        uint256 price
    );
    event MachineUsed(address indexed user, uint256 machineId, uint256 price);

    constructor() Ownable(msg.sender) {
        // Deploy ProfitSharingToken and transfer ownership to this contract
        profitToken = new ProfitSharingToken(
            "peaq Profit Sharing Token",
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

        // Check if it's first usage
        bool isFirstUse = !userUsedMachine[machineId][msg.sender];

        // Track usage (mark true permanently after first call)
        if (isFirstUse) {
            userUsedMachine[machineId][msg.sender] = true;
        }

        // Mint PFT: 100 PFT per 1 native token (wei adjusted for 18 decimals)
        uint256 minted = (msg.value * 100); // 1 ETH -> 100 PFT
        profitToken.mint(msg.sender, minted);

        emit MachineUsed(msg.sender, machineId, msg.value);
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
}
