import {
  address as proxyFactoryAddress,
  deployTransaction as deployModuleFactoryTx,
} from "../factories/proxyFactory";
import {
  address as singletonFactoryAddress,
  signedDeployTransaction as deploySingletonFactorySignedTx,
  fundingTransaction as singletonFundingTx,
} from "../factories/singletonFactory";
import { waitForTransaction } from "./misc";

import { EIP1193Provider } from "../types";

export default async function (provider: EIP1193Provider) {
  {
    const code = await provider.request({
      method: "eth_getCode",
      params: [singletonFactoryAddress],
    });
    if (code == "0x") {
      await deploySingletonFactory(provider);
    }
  }

  {
    const code = await provider.request({
      method: "eth_getCode",
      params: [proxyFactoryAddress],
    });
    if (code == "0x") {
      await deployModuleFactory(provider);
    }
  }
}

async function deploySingletonFactory(provider: EIP1193Provider) {
  {
    const hash = (await provider.request({
      method: "eth_sendTransaction",
      params: [singletonFundingTx],
    })) as string;
    await waitForTransaction(hash, provider);
  }

  {
    const hash = (await provider.request({
      method: "eth_sendRawTransaction",
      params: [deploySingletonFactorySignedTx],
    })) as string;
    await waitForTransaction(hash, provider);
  }

  const code = await provider.request({
    method: "eth_getCode",
    params: [singletonFactoryAddress],
  });
  if (code == "0x") {
    throw new Error("Bytecode for SingletonFactory not found");
  }
}

async function deployModuleFactory(provider: EIP1193Provider) {
  const hash = (await provider.request({
    method: "eth_sendTransaction",
    params: [deployModuleFactoryTx],
  })) as string;

  await waitForTransaction(hash, provider);

  const code = await provider.request({
    method: "eth_getCode",
    params: [proxyFactoryAddress],
  });
  if (code == "0x") {
    throw new Error("Bytecode for ModuleFactory not found");
  }
}
