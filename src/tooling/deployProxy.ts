import populateDeployProxy, {
  predictProxyAddress,
} from "../populateDeployProxy";

import { gasLimit, waitForTransaction } from "./misc";

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
) {
  const address = predictProxyAddress({
    mastercopy,
    setupArgs,
    saltNonce,
  });
  {
    const code = await provider.request({
      method: "eth_getCode",
      params: [address],
    });
    if (code != "0x") {
      throw new Error(`ModuleProxy already deployed at ${address}`);
    }
  }

  const transaction = {
    ...populateDeployProxy({
      mastercopy,
      setupArgs,
      saltNonce,
    }),
    gasLimit: await gasLimit(provider),
  };

  const hash = (await provider.request({
    method: "eth_sendTransaction",
    params: [transaction],
  })) as string;
  await waitForTransaction(hash, provider);

  {
    const code = await provider.request({
      method: "eth_getCode",
      params: [address],
    });
    if (code == "0x") {
      throw new Error(`ModuleProxy not found at ${address}`);
    }
  }
}
