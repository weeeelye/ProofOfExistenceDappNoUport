/**
 * Created on: 25 August 2018
 * @summary: Proof Of Existence Dapp
 * @author: Wee lye
 */
pragma solidity 0.4.24;

/** @title Ownable. */
contract Ownable
{
  address public owner;
  bool public onOffSwitch;

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
    require(onOffSwitch == true);
    _;
  }

  constructor() public
  {
    owner = msg.sender;
    onOffSwitch = true;
  }

  /** @dev Changes the owner of the contract.
      * @param newOwner The new owner's address.
      */
  function changeOwner(address newOwner) public
  onlyOwner checkAddress(newOwner)
  {
    address prevOwner = owner;
    owner = newOwner;
    emit OwnershipChanged(owner,prevOwner);
  }

  /** @dev Set the circuit breaker variable.
      * @param _onOffSwitch The circuit breaker variable. true = on, false = off
      */
  function setonOffSwitch(bool _onOffSwitch) public onlyOwner {
    onOffSwitch = _onOffSwitch;
  }
}
