import populateDeployMastercopy, {
  creationBytecode,
  predictMastercopyAddress,
} from "../populateDeployMastercopy";

import { waitForTransaction } from "./misc";

import { Create2Args, EIP1193Provider } from "../types";

export default async function deployMastercopy(
  { bytecode, constructorArgs, salt }: Create2Args,
  provider: EIP1193Provider
): Promise<{ address: string; noop: boolean }> {
  const address = predictMastercopyAddress({ bytecode, constructorArgs, salt });
  {
    const code = await provider.request({
      method: "eth_getCode",
      params: [address, "latest"],
    });
    if (code != "0x") {
      return { address, noop: true };
    }
  }

  /*
   * To address an RPC gas estimation issue with the CREATE2 opcode,
   * we combine the gas estimation for deploying from the factory contract
   * with the gas estimation for a simple inner contract deployment.
   */
  const [gasEstimation, innerGasEstimation] = await Promise.all([
    provider.request({
      method: "eth_estimateGas",
      params: [populateDeployMastercopy({ bytecode, constructorArgs, salt })],
    }),
    provider.request({
      method: "eth_estimateGas",
      params: [{ data: creationBytecode({ bytecode, constructorArgs }) }],
    }),
    0,
  ]);

  const transaction = {
    ...populateDeployMastercopy({
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

  {
    const code = await provider.request({
      method: "eth_getCode",
      params: [address, "latest"],
    });
    if (code == "0x") {
      throw new Error(`Mastercopy not found at ${address}`);
    }
  }
  return { address, noop: false };
}
