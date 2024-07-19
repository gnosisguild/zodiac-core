import { JsonRpcProvider, Wallet } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { EIP1193RequestFunc } from "../types";
import createAdapter from "./createAdapter";

const { MNEMONIC } = process.env;

export default function createHardhatAdapter(
  hre: HardhatRuntimeEnvironment
): EIP1193RequestFunc {
  const provider = hre.ethers.provider;

  const wallet = Wallet.fromPhrase(
    MNEMONIC ||
      "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat",
    provider
  );

  return createAdapter(provider as unknown as JsonRpcProvider, wallet);
}
