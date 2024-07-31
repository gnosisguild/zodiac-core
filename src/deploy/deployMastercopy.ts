import { getAddress } from "ethers";
import { address as erc2470FactoryAddress } from "../factory/erc2470Factory";
import { address as nickFactoryAddress } from "../factory/nickFactory";

import encodeDeployVia2470Factory from "../encoding/encodeDeployVia2470Factory";
import encodeDeployViaNickFactory from "../encoding/encodeDeployViaNickFactory";

import predictSingletonAddress, {
  creationBytecode,
} from "../encoding/predictSingletonAddress";

import waitForTransaction from "./waitForTransaction";

import { Create2Args, EIP1193Provider } from "../types";

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

  const encodeDeployTransaction = getEncodeDeployFn(factory);

  /*
   * To address an RPC gas estimation issue with the CREATE2 opcode,
   * we combine the gas estimation for deploying from the factory contract
   * with the gas estimation for a simple inner contract deployment.
   */
  const [gasEstimation, innerGasEstimation] = await Promise.all([
    provider.request({
      method: "eth_estimateGas",
      params: [encodeDeployTransaction({ bytecode, constructorArgs, salt })],
    }),
    provider.request({
      method: "eth_estimateGas",
      params: [{ data: creationBytecode({ bytecode, constructorArgs }) }],
    }),
    0,
  ]);

  const transaction = {
    ...encodeDeployTransaction({
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

function getEncodeDeployFn(factory: string) {
  if (getAddress(factory) == getAddress(nickFactoryAddress)) {
    return encodeDeployViaNickFactory;
  } else {
    return encodeDeployVia2470Factory;
  }
}
