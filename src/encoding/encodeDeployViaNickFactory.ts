import { AbiCoder, concat, TransactionRequest } from "ethers";
import { address as factoryAddress } from "../factory/nickFactory";
import { Create2Args } from "../types";

/**
 * Encodes the transaction request for deploying a contract using CREATE2.
 *
 * @param {Object} params - The function parameters.
 * @param {string} [params.factory=factoryAddress] - The address of the factory contract.
 * @param {string} params.bytecode - The bytecode of the contract to deploy.
 * @param {Object} params.constructorArgs - The constructor arguments for the contract.
 * @param {any[]} params.constructorArgs.types - The types of the constructor arguments.
 * @param {any[]} params.constructorArgs.values - The values of the constructor arguments.
 * @param {BigNumberish} params.salt - The salt value used for CREATE2 deployment.
 * @returns {TransactionRequest} The encoded transaction request.
 */
export default function encodeDeployTransaction({
  factory = factoryAddress,
  bytecode,
  constructorArgs: { types, values },
  salt,
}: Create2Args & { factory?: string }): TransactionRequest {
  const creationBytecode = concat([
    bytecode,
    AbiCoder.defaultAbiCoder().encode(types, values),
  ]);

  return {
    to: factory,
    data: concat([salt, creationBytecode]),
  };
}
