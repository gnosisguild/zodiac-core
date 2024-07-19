import { parseEther } from "ethers";

import { address, deployer, signedTransaction } from "./singletonFactory";

import { EIP1193RequestFunc } from "./types";

/**
 * Get the singleton factory contract (ERC-2470).
 * If it is not deployed on the network, then also deploy it.
 *
 * https://eips.ethereum.org/EIPS/eip-2470
 * @param hardhat
 * @returns Singleton Factory contract
 */

export default async function (request: EIP1193RequestFunc) {
  {
    const code = await request({
      method: "eth_getCode",
      params: [address],
    });
    const isDeployed = code != "0x";
    if (isDeployed) {
      return address;
    }
  }

  await request({
    method: "eth_sendTransaction",
    params: [{ to: deployer, value: parseEther("0.0247") }],
  });

  await request({
    method: "eth_sendRawTransaction",
    params: [signedTransaction],
  });

  {
    const code = await request({
      method: "eth_getCode",
      params: [address],
    });
    const isDeployed = code != "0x";
    if (!isDeployed) {
      throw Error(`SingletonFactory could not be deployed`);
    }
  }
  return address;
}
