import { getAddress } from "ethers";
import encodeDeployViaNickFactory from "./encodeDeployViaNickFactory";
import encodeDeployVia2470Factory from "./encodeDeployVia2470Factory";
import { address as nickFactoryAddress } from "../factory/nickFactory";
import { address as erc2470FactoryAddress } from "../factory/erc2470Factory";

/**
 * Encodes the transaction payload for deploying a singleton contract using the specified factory address.
 *
 * This function is used, for example, to deploy Mod Mastercopies, which are a type of Singleton contract.
 *
 * Depending on the provided factory address, the function selects the appropriate encoding method.
 * If the factory address matches the `nickFactoryAddress`, it uses the encoding for a Nick deployment.
 * Otherwise, it defaults to using the 2470 deployment encoding.
 *
 * @param {Object} params - The parameters for encoding the deployment.
 * @param {string} [params.factory=erc2470FactoryAddress] - The singleton factory address. Defaults to `erc2470FactoryAddress`.
 * Note: To deploy a singleton contract, you don't need to explicitly pass the factory address. If you leave it blank,
 * the default `erc2470FactoryAddress` will be used.
 * @param {string} params.bytecode - The bytecode of the contract to deploy.
 * @param {Object} params.constructorArgs - The constructor arguments for the singleton contract.
 * @param {any[]} params.constructorArgs.types - Types for the constructor arguments.
 * @param {any[]} params.constructorArgs.values - Values corresponding to the constructor argument types.
 * @param {string} params.salt - A deployment salt that is internally passed to create2
 *
 * @returns {string} The encoded deployment transaction.
 */
export default function encodeDeploySingletonTransaction({
  factory = erc2470FactoryAddress,
  bytecode,
  constructorArgs,
  salt,
}: {
  factory?: string;
  bytecode: string;
  constructorArgs: { types: any[]; values: any[] };
  salt: string;
}) {
  let encodeFn;
  if (getAddress(factory) == getAddress(nickFactoryAddress)) {
    encodeFn = encodeDeployViaNickFactory;
  } else {
    encodeFn = encodeDeployVia2470Factory;
  }

  return encodeFn({
    factory,
    bytecode,
    constructorArgs,
    salt,
  });
}
