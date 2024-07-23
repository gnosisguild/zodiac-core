import { BigNumberish, Signer } from "ethers";

import populateDeployProxy, {
  predictProxyAddress,
} from "./populateDeployProxy";

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
  signer: Signer
) {
  const provider = signer.provider!;
  const address = predictProxyAddress({
    mastercopy,
    setupArgs,
    saltNonce,
  });
  {
    const code = await provider.getCode(address);
    if (code != "0x") {
      throw new Error(`ModuleProxy already deployed at ${address}`);
    }
  }

  let gasLimit;
  switch ((await provider.getNetwork()).name) {
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
    ...populateDeployProxy({
      mastercopy,
      setupArgs,
      saltNonce,
    }),
    gasLimit,
  };

  const receipt = await signer.sendTransaction(transaction);
  await receipt.wait();

  {
    const code = await provider.getCode(address);
    if (code == "0x") {
      throw new Error(`ModuleProxy not found at ${address}`);
    }
  }
}
