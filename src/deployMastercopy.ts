import { Signer } from "ethers";

import populateDeployMastercopy, {
  predictMastercopyAddress,
} from "./populateDeployMastercopy";
import { Create2Args } from "./types";

export default async function deployMastercopy(
  { bytecode, constructorArgs, salt }: Create2Args,
  signer: Signer
) {
  const provider = signer.provider!;
  const address = predictMastercopyAddress({ bytecode, constructorArgs, salt });
  {
    const code = await provider!.getCode(address);
    if (code != "0x") {
      throw new Error(`Mastercopy already deployed at ${address}`);
    }
  }

  let gasLimit;
  switch ((await provider!.getNetwork()).name) {
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
    const code = await provider!.getCode(address);
    if (code == "0x") {
      throw new Error(`Mastercopy not found at ${address}`);
    }
  }
}
