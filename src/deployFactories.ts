import { JsonRpcProvider, Signer } from "ethers";
import {
  address as proxyFactoryAddress,
  deployTransaction as deployModuleFactoryTx,
} from "./factories/proxyFactory";
import {
  address as singletonFactoryAddress,
  signedDeployTransaction as deploySingletonFactorySignedTx,
  fundingTransaction as singletonFundingTx,
} from "./factories/singletonFactory";

export default async function (signer: Signer) {
  {
    const code = await signer.provider!.getCode(singletonFactoryAddress);
    if (code == "0x") {
      await deploySingletonFactory(signer);
    }
  }

  {
    const code = await signer.provider!.getCode(proxyFactoryAddress);
    if (code == "0x") {
      await deployModuleFactory(signer);
    }
  }
}

async function deploySingletonFactory(signer: Signer) {
  const receipt = await signer.sendTransaction(singletonFundingTx);
  await receipt.wait();

  const hash = await (signer.provider as JsonRpcProvider).send(
    "eth_sendRawTransaction",
    [deploySingletonFactorySignedTx]
  );

  await waitForTransaction(hash, signer);

  const code = await signer.provider!.getCode(singletonFactoryAddress);
  if (code == "0x") {
    throw new Error("Bytecode for SingletonFactory not found");
  }
}

async function deployModuleFactory(signer: Signer) {
  const receipt = await signer.sendTransaction(deployModuleFactoryTx);
  await receipt.wait();

  const code = await signer.provider!.getCode(proxyFactoryAddress);
  if (code == "0x") {
    throw new Error("Bytecode for ModuleFactory not found");
  }
}
async function waitForTransaction(hash: string, signer: Signer) {
  let receipt;
  while (!receipt) {
    receipt = await signer.provider!.getTransactionReceipt(hash);
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
