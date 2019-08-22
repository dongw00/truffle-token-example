/**
 * ERC-20 Token 만들기 실습
*/

pragma solidity ^0.5.2;

import 'openzeppelin-solidity/contracts/token/ERC20/ERC20.sol';

contract Token is ERC20 {
  string public constant name = "bitToken";
  string public constant symbol = "BTT";
  uint public constant decimals = 18;
  uint public constant INITIAL_SUPPLY = 1000000 * (10 ** decimals);

  /* Contract deployer */
  address public owner;

  /* ICO time */
  uint public start;
  uint public deadline;

  /* ICO info */
  uint public constant exchangeRate = 10;
  uint idx; // ICO 참여자 수
  uint saleStatus;

  mapping (uint => address) investor;   // ICO 참여자

  constructor() public {
    owner = msg.sender;
    _mint(msg.sender, INITIAL_SUPPLY);

    start = now;
    deadline = now + 1 days;
  }

  function invest() public payable {
    require(now < deadline, "The token sale has ended.");
    require(balanceOf(owner) >= msg.value * exchangeRate, "Not enough token sale amount");

    transferFrom(owner, msg.sender, msg.value * exchangeRate);

    if (balanceOf(msg.sender) == 0) {
      investor[idx++] = msg.sender;
    }

    saleStatus.add(msg.value * exchangeRate);
  }
}