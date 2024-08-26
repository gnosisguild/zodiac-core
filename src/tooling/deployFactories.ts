import {
  funding as nickFunding,
  deployer as nickDeployer,
  address as nickFactoryAddress,
  signedDeployTransaction as nickSignedDeployTransaction,
} from "../factory/nickFactory";

import {
  funding as erc2470Funding,
  deployer as erc2470Deployer,
  address as erc2470FactoryAddress,
  signedDeployTransaction as erc2470SignedDeployTransaction,
} from "../factory/erc2470Factory";

import {
  bytecode as proxyFactoryBytecode,
  salt as proxyFactorySalt,
} from "../factory/proxyFactory";

import deployMastercopy from "./deployMastercopy";
import waitForTransaction from "./waitForTransaction";

import { EIP1193Provider } from "../types";

/**
 * Deploys all factories within a specified network.
 *
 * This function deploys the following factories:
 * - `NickSingletonFactory`
 * - `ERC2470SingletonFactory`
 * - `ZodiacModuleProxyFactory`
 *
 * The first two factories, `NickSingletonFactory` and `ERC2470SingletonFactory`, use known presigned transactions for deployment.
 * The `ZodiacModuleProxyFactory` is deployed as a singleton via the `ERC2470SingletonFactory`.
 *
 * If all factories are already deployed, this function performs no operation.
 *
 * Note: Typically, these factories are already deployed across networks. This function is mostly useful for test setups.
 *
 * @param {Object} params - The function parameters.
 * @param {EIP1193Provider} params.provider - The EIP1193 compliant provider to interact with the blockchain.
 *
 * @returns {Promise<void>} A promise that resolves once the factories are deployed.
 */
export default async function ({
  provider,
}: {
  provider: EIP1193Provider;
}): Promise<void> {
  await deployKnownFactory({
    funding: nickFunding,
    deployer: nickDeployer,
    signedTransaction: nickSignedDeployTransaction,
    factoryAddress: nickFactoryAddress,
    provider,
  });

  await deployKnownFactory({
    funding: erc2470Funding,
    deployer: erc2470Deployer,
    signedTransaction: erc2470SignedDeployTransaction,
    factoryAddress: erc2470FactoryAddress,
    provider,
  });

  await deployMastercopy({
    bytecode: proxyFactoryBytecode,
    constructorArgs: { types: [], values: [] },
    salt: proxyFactorySalt,
    provider,
  });
}

/**
 * Deploys a known factory contract.
 *
 * @param {Object} params - The function parameters.
 * @param {bigint} params.funding - The amount of funding to send to the deployer.
 * @param {string} params.deployer - The address of the deployer.
 * @param {string} params.signedTransaction - The signed transaction to deploy the factory.
 * @param {string} params.factoryAddress - The address of the factory contract.
 * @param {EIP1193Provider} params.provider - The EIP1193 compliant provider to interact with the blockchain.
 * @returns {Promise<void>} A promise that resolves once the factory is deployed.
 * @throws {Error} If the factory bytecode is not found after deployment.
 */
async function deployKnownFactory({
  funding,
  deployer,
  signedTransaction,
  factoryAddress,
  provider,
}: {
  funding: bigint;
  deployer: string;
  signedTransaction: string;
  factoryAddress: string;
  provider: EIP1193Provider;
}): Promise<void> {
  // Check if the factory contract is already deployed
  {
    const code = await provider.request({
      method: "eth_getCode",
      params: [factoryAddress, "latest"],
    });
    if (code != "0x") {
      return;
    }
  }

  // Send funding to the deployer address
  {
    const hash = (await provider.request({
      method: "eth_sendTransaction",
      params: [{ to: deployer, value: funding }],
    })) as string;
    await waitForTransaction(hash, provider);
  }

  // Send the signed deploy transaction
  {
    const hash = (await provider.request({
      method: "eth_sendRawTransaction",
      params: [signedTransaction],
    })) as string;
    await waitForTransaction(hash, provider);
  }

  // Verify that the factory contract is deployed
  {
    const code = await provider.request({
      method: "eth_getCode",
      params: [factoryAddress, "latest"],
    });
    if (code == "0x") {
      throw new Error("Bytecode for Factory not found after deployment");
    }
  }
}
