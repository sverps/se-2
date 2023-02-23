//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "hardhat/console.sol";

// Use openzeppelin to inherit battle-tested implementations (ERC20, ERC721, etc)
// import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * A smart contract that allows changing a state variable of the contract and tracking the changes
 * It also allows the owner to withdraw the Ether in the contract
 * @author BuidlGuidl
 */
contract OtherContract {
  // State Variables
  address public immutable owner;
  string public goal = "Use a second contract...";
  bool public active = false;
  mapping(address => uint) public currentPrice;

  // Events: a way to emit log statements from smart contract that can be listened to by external parties
  event GreetingChange(address greetingSetter, string newGreeting, bool premium, uint256 value);

  // Constructor: Called once on contract deployment
  // Check packages/hardhat/deploy/00_deploy_your_contract.ts
  constructor(address _owner) {
    owner = _owner;
  }

  // Modifier: used to define a set of rules that must be met before or after a function is executed
  // Check the withdraw() function
  modifier isOwner() {
    // msg.sender: predefined variable that represents address of the account that called the current function
    require(msg.sender == owner, "Not the Owner");
    _;
  }

  /**
   * Function that allows anyone to change the state variable "greeting" of the contract and increase the counters
   *
   * @param _newPrice (string memory) - new greeting to save on the contract
   */
  function setPrice(uint256 _newPrice) public payable {
    // Print data to the hardhat chain console. Remove when deploying to a live network.
    console.log("Setting new greeting '%s' from %s", _newPrice, msg.sender);

    // Change state variables
    goal = "test";
    currentPrice[msg.sender] += 1;

    // msg.value: built-in global variable that represents the amount of ether sent with the transaction
    if (msg.value > 0) {
      active = true;
    } else {
      active = false;
    }

    // emit: keyword used to trigger an event
    emit GreetingChange(msg.sender, "test", msg.value > 0, 0);
  }

  /**
   * Function that allows the owner to withdraw all the Ether in the contract
   * The function can only be called by the owner of the contract as defined by the isOwner modifier
   */
  function withdraw() public isOwner {
    (bool success, ) = owner.call{value: address(this).balance}("");
    require(success, "Failed to send Ether");
  }

  /**
   * Function that allows the contract to receive ETH
   */
  receive() external payable {}
}
