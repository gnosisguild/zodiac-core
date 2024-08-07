import { AbiCoder, concat, TransactionRequest } from "ethers";
import { address as factoryAddress } from "../factory/nickFactory";
import { Create2Args } from "../types";

/**
 * Encodes the transaction request for deploying a Singleton via Nick factory.
 * @param {Object} params - The function parameters.
 * @param {string} [params.factory=factoryAddress] - The address of the factory contract.
 * If not provided, the default Nick factory address will be used. Note: To deploy a Singleton,
 * you don't need to explicitly pass the factory address. If you leave it blank, the default
 * `nickFactoryAddress` will be used.
 * @param {string} params.bytecode - The bytecode of the contract to deploy.
 * @param {Object} params.constructorArgs - The constructor arguments for the Singleton that is about to be deployed.
 * @param {any[]} params.constructorArgs.types - The types of the constructor arguments.
 * @param {any[]} params.constructorArgs.values - Values corresponding to the constructor argument types.
 * @param {string} params.salt - A deployment salt that is internally passed to create2
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
