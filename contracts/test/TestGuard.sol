// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity ^0.8.24;

import {IERC165} from "../interfaces/IERC165.sol";

import {BaseModuleGuard} from "../guard/BaseGuard.sol";
import {FactoryFriendly} from "../factory/FactoryFriendly.sol";
import {GuardableModule} from "../core/GuardableModule.sol";

import "../core/Operation.sol";

/* solhint-disable */

contract TestGuard is FactoryFriendly, BaseModuleGuard {
  event PreChecked(address module);
  event PostChecked(bool checked);

  address public module;

  constructor(address _module) {
    bytes memory initParams = abi.encode(_module);
    setUp(initParams);
  }

  function setModule(address _module) public {
    module = _module;
  }

  function checkModuleTransaction(
    address to,
    uint256 value,
    bytes memory data,
    Operation operation,
    address _module
  ) public override returns (bytes32) {
    require(to != address(0), "Cannot send to zero address");
    require(value != 1337, "Cannot send 1337");
    require(bytes3(data) != bytes3(0xbaddad), "Cannot call 0xbaddad");
    require(operation != Operation(1), "No delegate calls");
    emit PreChecked(_module);
    return keccak256(abi.encodePacked(to, value, data, operation, _module));
  }

  function checkAfterModuleExecution(bytes32, bool) public override {
    require(
      GuardableModule(module).guard() == address(this),
      "Module cannot remove its own guard."
    );
    emit PostChecked(true);
  }

  function setUp(bytes memory initializeParams) public override initializer {
    address _module = abi.decode(initializeParams, (address));
    module = _module;
  }
}

contract TestNonCompliantGuard is IERC165 {
  function supportsInterface(bytes4) external pure returns (bool) {
    return false;
  }
}
