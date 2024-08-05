import { AbiCoder, concat, getCreate2Address, keccak256 } from "ethers";
import { address as factoryAddress } from "../factory/erc2470Factory";
import { Create2Args } from "../types";

/**
 * Predicts the address of a singleton contract deployed using CREATE2.
 *
 * @param {Object} params - The function parameters.
 * @param {string} [params.factory=factoryAddress] - The address of the factory contract.
 * @param {string} params.bytecode - The bytecode of the contract to deploy.
 * @param {Object} params.constructorArgs - The constructor arguments for the contract.
 * @param {any[]} params.constructorArgs.types - The types of the constructor arguments.
 * @param {any[]} params.constructorArgs.values - The values of the constructor arguments.
 * @param {BigNumberish} params.salt - The salt value used for CREATE2 deployment.
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
