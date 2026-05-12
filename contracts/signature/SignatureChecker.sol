// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity ^0.8.28;

import {Operation} from "../core/Operation.sol";
import {IERC1271} from "./IERC1271.sol";

/// @title SignatureChecker - Verifies EIP-712 signatures over a ModuleTx.
/// @dev Supports EOA (ECDSA) and ERC-1271 contract signatures.
abstract contract SignatureChecker {
  /**
   * @notice Recovers the signer of a ModuleTx signature.
   * @dev Signature layout:
   *      - EOA:     `r || s || v`                   (65 bytes)
   *      - ERC1271: `signer || contractSignature`   (≥ 20 bytes; first 20 = signer)
   *
   *      Returns (bytes32(0), address(0)) when the signature is invalid.
   * @return hash The ModuleTx EIP-712 digest.
   * @return signer The recovered signer address.
   */
  function moduleTxSignedBy(
    address to,
    uint256 value,
    bytes calldata data,
    Operation operation,
    bytes32 salt,
    bytes calldata signature
  ) internal view returns (bytes32 hash, address signer) {
    hash = moduleTxHash(to, value, data, operation, salt);

    if (signature.length == 65) {
      bytes32 r = bytes32(signature[0:32]);
      bytes32 s = bytes32(signature[32:64]);
      uint8 v = uint8(signature[64]);
      signer = ecrecover(hash, v, r, s);
    } else if (signature.length >= 20) {
      signer = address(bytes20(signature[:20]));
      if (!_isValidContractSignature(signer, hash, signature[20:])) {
        signer = address(0);
      }
    }

    if (signer == address(0)) {
      hash = bytes32(0);
    }
  }

  /**
   * @notice Computes the EIP-712 digest of a ModuleTx.
   * @return The 32-byte hash that is to be signed.
   */
  function moduleTxHash(
    address to,
    uint256 value,
    bytes calldata data,
    Operation operation,
    bytes32 salt
  ) public view returns (bytes32) {
    bytes32 domainSeparator = keccak256(
      abi.encode(DOMAIN_SEPARATOR_TYPEHASH, block.chainid, this)
    );
    bytes32 structHash = keccak256(
      abi.encode(
        MODULE_TX_TYPEHASH,
        to,
        value,
        keccak256(data),
        operation,
        salt
      )
    );
    return
      keccak256(
        abi.encodePacked(
          bytes1(0x19),
          bytes1(0x01),
          domainSeparator,
          structHash
        )
      );
  }

  /**
   * @dev Calls the signer contract, and validates the contract signature.
   * @param signer The address of the signer contract.
   * @param hash Hash of the data signed
   * @param signature The contract signature.
   * @return result Indicates whether the signature is valid.
   */
  function _isValidContractSignature(
    address signer,
    bytes32 hash,
    bytes calldata signature
  ) internal view returns (bool result) {
    uint256 size;
    // eslint-disable-line no-inline-assembly
    assembly {
      size := extcodesize(signer)
    }
    if (size == 0) {
      return false;
    }

    (bool success, bytes memory returnData) = signer.staticcall(
      abi.encodeWithSelector(
        IERC1271.isValidSignature.selector,
        hash,
        signature
      )
    );

    return success && bytes4(returnData) == EIP1271_MAGIC_VALUE;
  }

  // keccak256(
  //     "EIP712Domain(uint256 chainId,address verifyingContract)"
  // );
  bytes32 private constant DOMAIN_SEPARATOR_TYPEHASH =
    0x47e79534a245952e8b16893a336b85a3d9ea9fa8c573f3d803afb92a79469218;

  // keccak256(
  //     "ModuleTx(address to,uint256 value,bytes data,uint8 operation,bytes32 salt)"
  // );
  bytes32 private constant MODULE_TX_TYPEHASH =
    0x73d8543ad6d885f580270da0b8273accec78d8732db45947d0dd843b1f4d07e7;

  // bytes4(keccak256(
  //     "isValidSignature(bytes32,bytes)"
  // ));
  bytes4 private constant EIP1271_MAGIC_VALUE = 0x1626ba7e;
}
