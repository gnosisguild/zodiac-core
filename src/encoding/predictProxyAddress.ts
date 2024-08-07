import {
  AbiCoder,
  BigNumberish,
  concat,
  getCreate2Address,
  Interface,
  keccak256,
} from "ethers";

import { address as factoryAddress } from "../factory/proxyFactory";

/**
 * Predicts the address of a proxy contract deployed via ModuleProxyFactory.
 * @param {Object} params - The function parameters.
 * @param {string} [params.factory=factoryAddress] - The address of the factory contract.
 * If not provided, the default ModuleProxyFactory address will be used. Note: To predict the address
 * of a proxy contract, you don't need to explicitly pass the factory address. If you leave it blank,
 * the default `proxyFactoryAddress` will be used.
 * @param {string} params.mastercopy - The address of the mastercopy contract.
 * @param {Object} params.setupArgs - The arguments for the setup function.
 * @param {any[]} params.setupArgs.types - The types of the setup arguments.
 * @param {any[]} params.setupArgs.values - The values of the setup arguments.
 * @param {BigNumberish} params.saltNonce - The saltNonce used to internally derive the final create2 salt.
 * @returns {string} The predicted address of the proxy contract.
 */
export default function predictProxyAddress({
  factory = factoryAddress,
  mastercopy,
  setupArgs,
  saltNonce,
}: {
  factory?: string;
  mastercopy: string;
  setupArgs: { types: any[]; values: any[] };
  saltNonce: BigNumberish;
}): string {
  const salt = keccak256(
    concat([
      keccak256(initializer({ setupArgs })),
      AbiCoder.defaultAbiCoder().encode(["uint256"], [saltNonce]),
    ])
  );
  return getCreate2Address(
    factory,
    salt,
    keccak256(creationBytecode({ mastercopy }))
  );
}

/**
 * Generates the creation bytecode for the proxy contract.
 *
 * @param {Object} params - The function parameters.
 * @param {string} params.mastercopy - The address of the mastercopy contract.
 * @returns {string} The creation bytecode for the proxy contract.
 */
function creationBytecode({ mastercopy }: { mastercopy: string }): string {
  const left = "0x602d8060093d393df3363d3d373d3d3d363d73";
  const right = "5af43d82803e903d91602b57fd5bf3";
  const center = mastercopy.toLowerCase().replace(/^0x/, "");
  return `${left}${center}${right}`;
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
