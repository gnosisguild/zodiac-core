import { HardhatRuntimeEnvironment } from "hardhat/types";

import populateDeployModuleAsProxy, {
  predictAddress,
} from "./populateDeployModuleAsProxy";

export default async function deployModuleAsProxy(
  {
    mastercopy,
    setupArgs,
    salt,
  }: {
    mastercopy: string;
    setupArgs: { types: any[]; values: any[] };
    salt: string;
  },
  hre: HardhatRuntimeEnvironment
) {
  const [signer] = await hre.ethers.getSigners();

  const address = predictAddress({ mastercopy, setupArgs, salt });
  {
    const code = await signer.provider.getCode(address);
    if (code != "0x") {
      throw new Error(`ModuleProxy already deployed at ${address}`);
    }
  }

  let gasLimit;
  switch ((await signer.provider.getNetwork()).name) {
    case "optimism":
      gasLimit = 6000000;
      break;
    case "arbitrum":
      gasLimit = 200000000;
      break;
    case "avalanche":
      gasLimit = 8000000;
      break;
    case "mumbai":
      gasLimit = 8000000;
      break;
    default:
      gasLimit = 10000000;
  }

  const transaction = {
    ...populateDeployModuleAsProxy({
      mastercopy,
      setupArgs,
      salt,
    }),
    gasLimit,
  };

  const receipt = await signer.sendTransaction(transaction);
  await receipt.wait();

  {
    const code = await signer.provider.getCode(address);
    if (code == "0x") {
      throw new Error(`ModuleProxy not found at ${address}`);
    }
  }
}

export const predictModuleAddress = predictAddress;
