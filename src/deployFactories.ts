import { HardhatRuntimeEnvironment } from "hardhat/types";

import {
  address as singletonFactoryAddress,
  signedDeployTransaction as deploySingletonFactorySignedTx,
  fundingTransaction as singletonFundingTx,
} from "./factories/singletonFactory";

import {
  address as moduleFactoryAddress,
  deployTransaction as deployModuleFactoryTx,
} from "./factories/moduleFactory";

export default async function (hre: HardhatRuntimeEnvironment) {
  const [signer] = await hre.ethers.getSigners();
  {
    const code = await signer.provider.getCode(singletonFactoryAddress);
    if (code == "0x") {
      await deploySingletonFactory(hre);
    }
  }

  {
    const code = await signer.provider.getCode(moduleFactoryAddress);
    if (code == "0x") {
      await deployModuleFactory(hre);
    }
  }
}

async function deploySingletonFactory(hre: HardhatRuntimeEnvironment) {
  const [signer] = await hre.ethers.getSigners();

  const receipt = await signer.sendTransaction(singletonFundingTx);
  await receipt.wait();

  const hash = await signer.provider.send("eth_sendRawTransaction", [
    deploySingletonFactorySignedTx,
  ]);
  await waitForReceipt(hre, hash);

  const code = await signer.provider.getCode(singletonFactoryAddress);
  if (code == "0x") {
    throw new Error("Bytecode for SingletonFactory not found");
  }
}

async function deployModuleFactory(hre: HardhatRuntimeEnvironment) {
  const [signer] = await hre.ethers.getSigners();

  const receipt = await signer.sendTransaction(deployModuleFactoryTx);
  await receipt.wait();

  const code = await signer.provider.getCode(moduleFactoryAddress);
  if (code == "0x") {
    throw new Error("Bytecode for ModuleFactory not found");
  }
}

async function waitForReceipt(hre: HardhatRuntimeEnvironment, hash: string) {
  let receipt;
  while (!receipt) {
    receipt = await hre.ethers.provider.getTransactionReceipt(hash);
    if (!receipt) {
      await wait(200);
    }
  }
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}
