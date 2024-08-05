import { getAddress } from "ethers";
import encodeDeployViaNickFactory from "./encodeDeployViaNickFactory";
import encodeDeployVia2470Factory from "./encodeDeployVia2470Factory";
import { address as nickFactoryAddress } from "../factory/nickFactory";
/**
 * Returns the appropriate function to encode the deploy transaction based on the factory address.
 *
 * @param {string} factory - The address of the factory contract.
 * @returns {function} The function to encode the deploy transaction.
 */
export function encodeDeploySingleton(factory: string) {
  if (getAddress(factory) == getAddress(nickFactoryAddress)) {
    return encodeDeployViaNickFactory;
  } else {
    return encodeDeployVia2470Factory;
  }
}
