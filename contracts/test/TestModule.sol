// SPDX-License-Identifier: LGPL-3.0-only

/// @title Modifier Interface - A contract that sits between a Module and an Avatar and enforce some additional logic.
pragma solidity ^0.8.24;

import "../core/GuardableModule.sol";

contract TestModule is GuardableModule {
  constructor(address _avatar, address _target) {
    bytes memory initParams = abi.encode(_avatar, _target);
    setUp(initParams);
  }

  event executed(
    address to,
    uint256 value,
    bytes data,
    Operation operation,
    bool success
  );
  event executedAndReturnedData(
    address to,
    uint256 value,
    bytes data,
    Operation operation,
    bytes returnData,
    bool success
  );

  function executeTransaction(
    address to,
    uint256 value,
    bytes memory data,
    Operation operation
  ) public returns (bool success) {
    success = exec(to, value, data, operation);
    emit executed(to, value, data, operation, success);
  }

  function executeTransactionReturnData(
    address to,
    uint256 value,
    bytes memory data,
    Operation operation
  ) public returns (bool success, bytes memory returnData) {
    (success, returnData) = execAndReturnData(to, value, data, operation);
    emit executedAndReturnedData(
      to,
      value,
      data,
      operation,
      returnData,
      success
    );
  }

  function setUp(bytes memory initializeParams) public override initializer {
    _transferOwnership(msg.sender);
    (address _avatar, address _target) = abi.decode(
      initializeParams,
      (address, address)
    );
    avatar = _avatar;
    target = _target;
  }
}
