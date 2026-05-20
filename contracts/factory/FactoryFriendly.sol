// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity ^0.8.24;

import {Initializable} from "./Initializable.sol";

/// @title Zodiac FactoryFriendly - A contract that allows other contracts to be initializable and pass bytes as arguments to define contract state
abstract contract FactoryFriendly is Initializable {
  function setUp(bytes memory initializeParams) public virtual;
}
