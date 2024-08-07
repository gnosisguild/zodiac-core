import { AbiCoder, concat, getCreate2Address, keccak256 } from "ethers";
import { address as factoryAddress } from "../factory/erc2470Factory";
import { Create2Args } from "../types";

/**
 * Predicts the address of a proxy contract deployed via SingletonFactory.
 * Note: The calculation method is the same regardless of whether the factory is Nick or EIP2470.
 * @param {Object} params - The parameters for predicting the address.
 * @param {string} [params.factory=erc3460FactoryAddress] - The address of the factory contract.
 * If not provided, the default ERC2470Factory address will be used. Note: To predict the address of a
 * singleton contract, you don't need to explicitly pass the factory address. If you leave it blank,
 * the default `erc2470FactoryAddress` will be used.
 * @param {string} params.bytecode - The bytecode of the contract to deploy.
 * @param {Object} params.constructorArgs - The constructor arguments for the contract.
 * @param {any[]} params.constructorArgs.types - The types of the constructor arguments.
 * @param {any[]} params.constructorArgs.values - Values corresponding to the constructor argument types.
 * @param {string} params.salt - A deployment salt that is internally passed to create2
 * @returns {string} The predicted address of the singleton contract.
 */
export default function predictSingletonAddress({
  factory = factoryAddress,
  bytecode,
  constructorArgs,
  salt,
}: Create2Args & { factory?: string }): string {
  return getCreate2Address(
    factory,
    salt,
    keccak256(creationBytecode({ bytecode, constructorArgs }))
  );
}

/**
 * Generates the creation bytecode for the contract.
 *
 * @param {Object} params - The function parameters.
 * @param {string} params.bytecode - The bytecode of the contract.
 * @param {Object} params.constructorArgs - The constructor arguments for the contract.
 * @param {any[]} params.constructorArgs.types - The types of the constructor arguments.
 * @param {any[]} params.constructorArgs.values - The values of the constructor arguments.
 * @returns {string} The creation bytecode for the contract.
 */
export function creationBytecode({
  bytecode,
  constructorArgs: { types, values },
}: {
  bytecode: string;
  constructorArgs: { types: any[]; values: any[] };
}): string {
  return concat([bytecode, AbiCoder.defaultAbiCoder().encode(types, values)]);
}
