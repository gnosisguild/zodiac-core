import populateDeployProxy from "../encoding/encodeDeployProxy";
import predictProxyAddress from "../encoding/predictProxyAddress";
import waitForTransaction from "./waitForTransaction";

import { EIP1193Provider } from "../types";

/**
 * Deploys a module as a proxy contract.
 *
 * @param {Object} params - The function parameters.
 * @param {string} params.mastercopy - The address of the mastercopy contract.
 * @param {Object} params.setupArgs - The arguments for the setup function.
 * @param {any[]} params.setupArgs.types - The types of the setup arguments.
 * @param {any[]} params.setupArgs.values - The values of the setup arguments.
 * @param {string | number | bigint} params.saltNonce - The salt nonce used to predict the proxy address.
 * @param {EIP1193Provider} params.provider - The EIP1193 compliant provider to interact with the blockchain.
 * @returns {Promise<{ address: string; noop: boolean }>} The address of the deployed proxy contract and a noop flag indicating if the deployment was a no-operation.
 */
export default async function deployModuleAsProxy({
  mastercopy,
  setupArgs,
  saltNonce,
  provider,
}: {
  mastercopy: string;
  setupArgs: { types: any[]; values: any[] };
  saltNonce: string | number | bigint;
  provider: EIP1193Provider;
}): Promise<{ address: string; noop: boolean }> {
  const address = predictProxyAddress({
    mastercopy,
    setupArgs,
    saltNonce,
  });

  const code = await provider.request({
    method: "eth_getCode",
    params: [address, "latest"],
  });
  if (code != "0x") {
    return { address, noop: true };
  }

  const transaction = populateDeployProxy({
    mastercopy,
    setupArgs,
    saltNonce,
  });

  const hash = (await provider.request({
    method: "eth_sendTransaction",
    params: [transaction],
  })) as string;
  await waitForTransaction(hash, provider);

  return { address, noop: false };
}
