// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity >=0.7.0 <0.9.0;

abstract contract Initializable {
  bool private _initialized;

  error AlreadyInitialized();

  modifier initializer() {
    if (_initialized) revert AlreadyInitialized();
    _initialized = true;
    _;
  }
}
