// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity ^0.8.24;

abstract contract Initializable {
  bool private _initialized;

  error AlreadyInitialized();

  modifier initializer() {
    if (_initialized) revert AlreadyInitialized();
    _initialized = true;
    _;
  }
}
