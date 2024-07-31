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

export default async function ({ provider }: { provider: EIP1193Provider }) {
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
}) {
  {
    const code = await provider.request({
      method: "eth_getCode",
      params: [factoryAddress, "latest"],
    });
    if (code != "0x") {
      return;
    }
  }

  {
    const hash = (await provider.request({
      method: "eth_sendTransaction",
      params: [{ to: deployer, value: funding }],
    })) as string;
    await waitForTransaction(hash, provider);
  }

  {
    const hash = (await provider.request({
      method: "eth_sendRawTransaction",
      params: [signedTransaction],
    })) as string;
    await waitForTransaction(hash, provider);
  }

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
