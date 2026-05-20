// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity ^0.8.24;

import "../core/GuardableModifier.sol";

contract TestGuardableModifier is GuardableModifier {
  event Executed(
    address to,
    uint256 value,
    bytes data,
    Operation operation,
    bool success
  );

  event ExecutedAndReturnedData(
    address to,
    uint256 value,
    bytes data,
    Operation operation,
    bytes returnData,
    bool success
  );

  constructor(address _avatar, address _target) {
    bytes memory initParams = abi.encode(_avatar, _target);
    setUp(initParams);
  }

  /// @dev Passes a transaction to the modifier.
  /// @param to Destination address of module transaction
  /// @param value Ether value of module transaction
  /// @param data Data payload of module transaction
  /// @param operation Operation type of module transaction
  /// @notice Can only be called by enabled modules
  function execTransactionFromModule(
    address to,
    uint256 value,
    bytes calldata data,
    Operation operation
  ) public override moduleOnly returns (bool success) {
    success = exec(to, value, data, operation);
    emit Executed(to, value, data, operation, success);
  }

  /// @dev Passes a transaction to the modifier, expects return data.
  /// @param to Destination address of module transaction
  /// @param value Ether value of module transaction
  /// @param data Data payload of module transaction
  /// @param operation Operation type of module transaction
  /// @notice Can only be called by enabled modules
  function execTransactionFromModuleReturnData(
    address to,
    uint256 value,
    bytes calldata data,
    Operation operation
  ) public override moduleOnly returns (bool success, bytes memory returnData) {
    (success, returnData) = execAndReturnData(to, value, data, operation);
    emit ExecutedAndReturnedData(
      to,
      value,
      data,
      operation,
      returnData,
      success
    );
  }

  function execTransactionFromModuleSigned(
    ModuleTx memory moduleTx,
    bytes32 salt,
    bytes calldata signature
  ) public moduleOnlySigned(moduleTx, salt, signature) returns (bool success) {
    success = _execTransactionFromModuleSigned(moduleTx);
  }

  function _execTransactionFromModuleSigned(
    ModuleTx memory moduleTx
  ) private returns (bool success) {
    success = exec(
      moduleTx.to,
      moduleTx.value,
      moduleTx.data,
      moduleTx.operation
    );
    emit Executed(
      moduleTx.to,
      moduleTx.value,
      moduleTx.data,
      moduleTx.operation,
      success
    );
  }

  function execTransactionFromModuleReturnDataSigned(
    ModuleTx memory moduleTx,
    bytes32 salt,
    bytes calldata signature
  )
    public
    moduleOnlySigned(moduleTx, salt, signature)
    returns (bool, bytes memory)
  {
    return _execTransactionFromModuleReturnDataSigned(moduleTx);
  }

  function _execTransactionFromModuleReturnDataSigned(
    ModuleTx memory moduleTx
  ) private returns (bool, bytes memory) {
    (bool success, bytes memory returnData) = execAndReturnData(
      moduleTx.to,
      moduleTx.value,
      moduleTx.data,
      moduleTx.operation
    );
    emit ExecutedAndReturnedData(
      moduleTx.to,
      moduleTx.value,
      moduleTx.data,
      moduleTx.operation,
      returnData,
      success
    );
    return (success, returnData);
  }

  function setUp(bytes memory initializeParams) public override initializer {
    setupModules();
    _transferOwnership(msg.sender);
    (address _avatar, address _target) = abi.decode(
      initializeParams,
      (address, address)
    );
    avatar = _avatar;
    target = _target;
  }

  function attemptToSetupModules() public {
    setupModules();
  }
}
