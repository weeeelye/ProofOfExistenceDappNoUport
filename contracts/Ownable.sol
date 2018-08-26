pragma solidity 0.4.24;

contract Ownable
{
  address public owner;
  bool public killSwitch;

  event OwnershipChanged(address currentOwner, address previousOwner);

  modifier onlyOwner
  {
    require(msg.sender == owner);
    _;
  }

  modifier checkAddress(address newOwner)
  {
    require (owner != newOwner);
    require (newOwner != address(0));
    _;
  }

  modifier switchOn
  {
    require(killSwitch == true);
    _;
  }

  constructor() public
  {
    owner = msg.sender;
    killSwitch = true;
  }

  function changeOwner(address newOwner) public
  onlyOwner checkAddress(newOwner)
  {
    address prevOwner = owner;
    owner = newOwner;
    emit OwnershipChanged(owner,prevOwner);
  }

  function withdraw() public onlyOwner {
    owner.transfer(address(this).balance);
  }

  function setKillSwitch(bool _killSwitch) public onlyOwner {
    killSwitch = _killSwitch;
  }

  function kill() public onlyOwner {
    selfdestruct(owner);
  }
}
