import populateDeployProxy, {
  predictProxyAddress,
} from "../populateDeployProxy";

import { waitForTransaction } from "./misc";

import { EIP1193Provider } from "../types";

export default async function deployModuleAsProxy(
  {
    mastercopy,
    setupArgs,
    saltNonce,
  }: {
    mastercopy: string;
    setupArgs: { types: any[]; values: any[] };
    saltNonce: string | number | bigint;
  },
  provider: EIP1193Provider
): Promise<{ address: string; noop: boolean }> {
  const address = predictProxyAddress({
    mastercopy,
    setupArgs,
    saltNonce,
  });
  {
    const code = await provider.request({
      method: "eth_getCode",
      params: [address, "latest"],
    });
    if (code != "0x") {
      return { address, noop: true };
    }
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

  {
    const code = await provider.request({
      method: "eth_getCode",
      params: [address, "latest"],
    });
    if (code == "0x") {
      throw new Error(`ModuleProxy not found at ${address}`);
    }

    return { address, noop: false };
  }
}
