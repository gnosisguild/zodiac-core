import populateDeployMastercopy, {
  predictMastercopyAddress,
} from "../populateDeployMastercopy";

import { gasLimit, waitForTransaction } from "./misc";

import { Create2Args, EIP1193Provider } from "../types";

export default async function deployMastercopy(
  { bytecode, constructorArgs, salt }: Create2Args,
  provider: EIP1193Provider
) {
  const address = predictMastercopyAddress({ bytecode, constructorArgs, salt });
  {
    const code = await provider.request({
      method: "eth_getCode",
      params: [address],
    });
    if (code != "0x") {
      throw new Error(`Mastercopy already deployed at ${address}`);
    }
  }

  const transaction = {
    ...populateDeployMastercopy({
      bytecode,
      constructorArgs,
      salt,
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
      throw new Error(`Mastercopy not found at ${address}`);
    }
  }
}
