import { HardhatRuntimeEnvironment } from "hardhat/types";

import populateDeployMastercopy, {
  predictMastercopyAddress,
} from "./populateDeployMastercopy";
import { Create2Args } from "./types";

export default async function deployMastercopy(
  { bytecode, constructorArgs, salt }: Create2Args,
  hre: HardhatRuntimeEnvironment
) {
  const [signer] = await hre.ethers.getSigners();

  const address = predictMastercopyAddress({ bytecode, constructorArgs, salt });
  {
    const code = await signer.provider.getCode(address);
    if (code != "0x") {
      throw new Error(`Mastercopy already deployed at ${address}`);
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
    ...populateDeployMastercopy({
      bytecode,
      constructorArgs,
      salt,
    }),
    gasLimit,
  };

  const receipt = await signer.sendTransaction(transaction);
  await receipt.wait();
  {
    const code = await signer.provider.getCode(address);
    if (code == "0x") {
      throw new Error(`Mastercopy not found at ${address}`);
    }
  }
}
