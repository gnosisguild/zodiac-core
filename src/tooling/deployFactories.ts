import {
  bytecode as proxyFactoryBytecode,
  salt as proxyFactorySalt,
} from "../factories/proxyFactory";
import {
  address as singletonFactoryAddress,
  signedDeployTransaction as deploySingletonFactorySignedTx,
  fundingTransaction as singletonFundingTx,
} from "../factories/singletonFactory";

import deploySingleton from "./deployMastercopy";
import waitForTransaction from "./internal/waitForTransaction";

import { EIP1193Provider } from "../types";

export default async function (provider: EIP1193Provider) {
  await deploySingletonFactory(provider);
  await deployProxyFactory(provider);
}

async function deploySingletonFactory(provider: EIP1193Provider) {
  {
    const code = await provider.request({
      method: "eth_getCode",
      params: [singletonFactoryAddress, "latest"],
    });
    if (code != "0x") {
      return { address: singletonFactoryAddress, noop: true };
    }
  }

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

  {
    const code = await provider.request({
      method: "eth_getCode",
      params: [singletonFactoryAddress, "latest"],
    });
    if (code == "0x") {
      throw new Error("Bytecode for SingletonFactory not found");
    }
  }

  return { address: singletonFactoryAddress, noop: false };
}

async function deployProxyFactory(provider: EIP1193Provider) {
  return await deploySingleton(
    {
      bytecode: proxyFactoryBytecode,
      constructorArgs: { types: [], values: [] },
      salt: proxyFactorySalt,
    },
    provider
  );
}
