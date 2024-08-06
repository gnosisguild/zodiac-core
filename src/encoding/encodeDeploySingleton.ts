import { getAddress } from "ethers";
import encodeDeployViaNickFactory from "./encodeDeployViaNickFactory";
import encodeDeployVia2470Factory from "./encodeDeployVia2470Factory";
import { address as nickFactoryAddress } from "../factory/nickFactory";
import { address as erc2470FactoryAddress } from "../factory/erc2470Factory";

/**
 * Encodes deployment data for a singleton contract based on the provided factory address.
 *
 * Depending on the factory address, the function chooses the appropriate encoding function
 * (`encodeDeployViaNickFactory` or `encodeDeployVia2470Factory`) to generate the deployment transaction.
 *
 * @param {Object} params - The parameters for encoding the deployment.
 * @param {string} [params.factory=erc2470FactoryAddress] - The factory address to use for encoding.
 * @param {string} params.bytecode - The bytecode of the contract to deploy.
 * @param {Object} params.constructorArgs - The constructor arguments for the contract.
 * @param {Array} params.constructorArgs.types - The types of the constructor arguments.
 * @param {Array} params.constructorArgs.values - The values of the constructor arguments.
 * @param {string} params.salt - A salt value used for the deployment encoding.
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
