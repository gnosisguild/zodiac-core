// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity ^0.8.24;

import "../core/Operation.sol";

interface IGuard {
  function checkTransaction(
    address to,
    uint256 value,
    bytes memory data,
    Operation operation,
    uint256 safeTxGas,
    uint256 baseGas,
    uint256 gasPrice,
    address gasToken,
    address payable refundReceiver,
    bytes memory signatures,
    address msgSender
  ) external;

  function checkAfterExecution(bytes32 txHash, bool success) external;
}

interface IModuleGuard {
  function checkModuleTransaction(
    address to,
    uint256 value,
    bytes memory data,
    Operation operation,
    address module
  ) external returns (bytes32 moduleTxHash);

  function checkAfterModuleExecution(
    bytes32 moduleTxHash,
    bool success
  ) external;
}
