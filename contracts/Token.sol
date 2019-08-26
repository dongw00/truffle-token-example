/**
 * ERC-20 Token 만들기 실습
*/

pragma solidity ^0.5.2;

/* Token */
import '@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20Mintable.sol';

/* CrowdSale */
import '@openzeppelin/contracts/crowdsale/validation/CappedCrowdsale.sol';
import '@openzeppelin/contracts/crowdsale/emission/MintedCrowdsale.sol';


contract Token is ERC20Detailed, ERC20Mintable {
  string public constant _name = "bitToken";
  string public constant _symbol = "BTT";
  uint256 public constant _INITIAL_SUPPLY = 50000 * (10 ** 18);

  constructor() ERC20Detailed(_name, _symbol, 18) public {
    _mint(msg.sender, _INITIAL_SUPPLY);
  }
}

contract TokenCrowdSale is CappedCrowdsale, MintedCrowdsale {
  uint256 public constant _rate = 100;
  uint256 public constant _cap = 1000000000000000000000;
  constructor(
    address payable _wallet,
    ERC20Mintable token
  ) public
    Crowdsale(_rate, _wallet, token)
    CappedCrowdsale(_cap)
    {

    }
}