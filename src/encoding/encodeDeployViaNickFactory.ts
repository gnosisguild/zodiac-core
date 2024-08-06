import { AbiCoder, concat, TransactionRequest } from "ethers";
import { address as factoryAddress } from "../factory/nickFactory";
import { Create2Args } from "../types";

/**
 * Predicts the address of a proxy contract deployed via ModuleProxyFactory.
 * @param {Object} params - The function parameters.
 * @param {string} [params.factory=factoryAddress] - The address of the factory contract.
 * @param {string} params.mastercopy - The address of the mastercopy contract.
 * @param {Object} params.setupArgs - The arguments for the setup function.
 * @param {any[]} params.setupArgs.types - The types of the setup arguments.
 * @param {any[]} params.setupArgs.values - The values of the setup arguments.
 * @param {BigNumberish} params.saltNonce - The saltNonce used to internally derive the final create2 salt.
 * @returns {string} The predicted address of the proxy contract.
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
