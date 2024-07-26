import { EIP1193Provider } from "../../types";

export default async function waitForTransaction(
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
