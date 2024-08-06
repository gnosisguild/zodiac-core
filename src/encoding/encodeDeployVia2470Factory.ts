import { AbiCoder, concat, TransactionRequest } from "ethers";
import {
  address as factoryAddress,
  iface as factoryInterface,
} from "../factory/erc2470Factory";
import { Create2Args } from "../types";

/**
 *Encodes the transaction request for deploying a Singleton via ERC2470Factory.
 *@param {Object} params - The function parameters.
 *@param {string} [params.factory=factoryAddress] - The address of the factory contract.
 *@param {string} params.bytecode - The bytecode of the contract to deploy.
 *@param {Object} params.constructorArgs - The constructor arguments for the Singleton that is about to be deployed.
 *@param {any[]} params.constructorArgs.types - The types of the constructor arguments.
 *@param {any[]} params.constructorArgs.values - Values corresponding to the constructor argument types.
 *@param {string} params.salt - A deployment salt that is internally passed to create2
 *@returns {TransactionRequest} The encoded transaction request.
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
    data: factoryInterface.encodeFunctionData("deploy", [
      creationBytecode,
      salt,
    ]),
  };
}
