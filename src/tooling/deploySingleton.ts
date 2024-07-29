import encodeDeploySingletonTransaction, {
  creationBytecode,
} from "../encoding/encodeDeploySingletonTransaction";
import predictSingletonAddress from "../encoding/predictSingletonAddress";

import waitForTransaction from "./internal/waitForTransaction";

import { Create2Args, EIP1193Provider } from "../types";

export default async function deploySingleton({
  bytecode,
  constructorArgs,
  salt,
  provider,
  onStart,
}: Create2Args & {
  provider: EIP1193Provider;
  onStart?: () => void;
}): Promise<{
  address: string;
  noop: boolean;
}> {
  const address = predictSingletonAddress({ bytecode, constructorArgs, salt });
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
        encodeDeploySingletonTransaction({ bytecode, constructorArgs, salt }),
      ],
    }),
    provider.request({
      method: "eth_estimateGas",
      params: [{ data: creationBytecode({ bytecode, constructorArgs }) }],
    }),
    0,
  ]);

  const transaction = {
    ...encodeDeploySingletonTransaction({
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
