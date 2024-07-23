import { BigNumberish } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import populateDeployModuleAsProxy, {
  predictModuleAddress,
} from "./populateDeployModuleAsProxy";

export default async function deployModuleAsProxy(
  {
    mastercopy,
    setupArgs,
    saltNonce,
  }: {
    mastercopy: string;
    setupArgs: { types: any[]; values: any[] };
    saltNonce: BigNumberish;
  },
  hre: HardhatRuntimeEnvironment
) {
  const [signer] = await hre.ethers.getSigners();

  const address = predictModuleAddress({ mastercopy, setupArgs, saltNonce });
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
      saltNonce,
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
