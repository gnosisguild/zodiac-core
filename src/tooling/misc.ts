import { EIP1193Provider } from "../types";

export async function gasLimit(provider: EIP1193Provider) {
  let gasLimit;

  const chainId = Number(await provider.request({ method: "eth_chainId" }));

  switch (chainId) {
    // optimism
    case 10:
      gasLimit = 6000000;
      break;
    // arbitrum
    case 42161:
      gasLimit = 200000000;
      break;
    // avalanche
    case 43114:
      gasLimit = 8000000;
      break;
    // mumbai
    case 80001:
      gasLimit = 8000000;
      break;
    default:
      gasLimit = 10000000;
  }
  return gasLimit;
}

export async function waitForTransaction(
  hash: string,
  provider: EIP1193Provider
) {
  let receipt;
  while (!receipt) {
    receipt = await provider.request({
      method: "eth_getTransactionReceipt",
      params: [hash],
    });
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
