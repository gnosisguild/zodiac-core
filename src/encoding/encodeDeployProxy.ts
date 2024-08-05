import { AbiCoder, BigNumberish, Interface, TransactionRequest } from "ethers";

import {
  address as factoryAddress,
  iface as factoryIFace,
} from "../factory/proxyFactory";

/**
 * Encodes the transaction request for deploying a proxy contract.
 *
 * @param {Object} params - The function parameters.
 * @param {string} [params.factory=factoryAddress] - The address of the factory contract.
 * @param {string} params.mastercopy - The address of the mastercopy contract.
 * @param {Object} params.setupArgs - The arguments for the setup function.
 * @param {any[]} params.setupArgs.types - The types of the setup arguments.
 * @param {any[]} params.setupArgs.values - The values of the setup arguments.
 * @param {BigNumberish} params.saltNonce - The salt nonce used to predict the proxy address.
 * @returns {TransactionRequest} The encoded transaction request.
 */
export default function encodeDeployProxyTransaction({
  factory = factoryAddress,
  mastercopy,
  setupArgs,
  saltNonce,
}: {
  factory?: string;
  mastercopy: string;
  setupArgs: { types: any[]; values: any[] };
  saltNonce: BigNumberish;
}): TransactionRequest {
  return {
    to: factory,
    data: factoryIFace.encodeFunctionData("deployModule", [
      mastercopy,
      initializer({ setupArgs }),
      saltNonce,
    ]),
  };
}

/**
 * Encodes the initializer data for the setup function.
 *
 * @param {Object} params - The function parameters.
 * @param {Object} params.setupArgs - The arguments for the setup function.
 * @param {any[]} params.setupArgs.types - The types of the setup arguments.
 * @param {any[]} params.setupArgs.values - The values of the setup arguments.
 * @returns {string} The encoded initializer data.
 */
function initializer({
  setupArgs,
}: {
  setupArgs: { types: any[]; values: any[] };
}): string {
  const proxyInterface = new Interface([
    "function setUp(bytes memory initializeParams)",
  ]);

  return proxyInterface.encodeFunctionData("setUp", [
    AbiCoder.defaultAbiCoder().encode(setupArgs.types, setupArgs.values),
  ]);
}
