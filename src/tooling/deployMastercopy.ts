import { address as erc2470FactoryAddress } from "../factory/erc2470Factory";

import encodeDeploySingleton from "../encoding/encodeDeploySingleton";
import predictSingletonAddress, {
  creationBytecode,
} from "../encoding/predictSingletonAddress";

import waitForTransaction from "./waitForTransaction";

import { Create2Args, EIP1193Provider } from "../types";

/**
 * Deploys a Mastercopy via a SingletonFactory
 *
 * @param {Object} params - The function parameters.
 * @param {string} [params.factory=erc2470FactoryAddress] - The address of the factory to use.
 * @param {string} params.bytecode - The bytecode of the contract to deploy.
 * @param {Object} params.constructorArgs - The constructor arguments for the contract.
 * @param {any[]} params.constructorArgs.types - The types of the constructor arguments.
 * @param {any[]} params.constructorArgs.values - The values of the constructor arguments.
 * @param {string | number | bigint} params.salt - The salt value used for CREATE2 deployment.
 * @param {EIP1193Provider} params.provider - The EIP1193 compliant provider to interact with the blockchain.
 * @param {function} [params.onStart] - Optional callback function to call when the deployment starts.
 *
 * @returns {Promise<{ address: string; noop: boolean }>} The address of the deployed mastercopy contract and a noop flag indicating if the deployment was a no-operation.
 */
export default async function deployMastercopy({
  factory = erc2470FactoryAddress,
  bytecode,
  constructorArgs,
  salt,
  provider,
  onStart,
}: Create2Args & {
  factory?: string;
  provider: EIP1193Provider;
  onStart?: () => void;
}): Promise<{
  address: string;
  noop: boolean;
}> {
  const address = predictSingletonAddress({
    factory,
    bytecode,
    constructorArgs,
    salt,
  });
  const code = await provider.request({
    method: "eth_getCode",
    params: [address, "latest"],
  });
  if (code != "0x") {
    return { address, noop: true };
  }

  onStart && onStart();

  /*
   * To address an RPC gas estimation issue with the CREATE2 opcode,
   * we combine the gas estimation for deploying from the factory contract
   * with the gas estimation for a simple inner contract deployment.
   */
  const [gasEstimation, innerGasEstimation] = await Promise.all([
    provider.request({
      method: "eth_estimateGas",
      params: [
        encodeDeploySingleton({ factory, bytecode, constructorArgs, salt }),
      ],
    }),
    provider.request({
      method: "eth_estimateGas",
      params: [{ data: creationBytecode({ bytecode, constructorArgs }) }],
    }),
    0,
  ]);

  const transaction = {
    ...encodeDeploySingleton({
      bytecode,
      constructorArgs,
      salt,
    }),
    gasLimit: Number(gasEstimation) + Number(innerGasEstimation),
  };

  const hash = (await provider.request({
    method: "eth_sendTransaction",
    params: [transaction],
  })) as string;

  await waitForTransaction(hash, provider);

  return { address, noop: false };
}
