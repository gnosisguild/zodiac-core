import { JsonRpcProvider, Signer, TransactionRequest } from "ethers";
import { EIP1193RequestFunc } from "../types";

export default function createAdapter(
  provider: JsonRpcProvider,
  signer: Signer
): EIP1193RequestFunc {
  return async ({ method, params }) => {
    if (method == "eth_sendTransaction") {
      const tx = await signer.populateTransaction(
        params[0] as TransactionRequest
      );
      const signedTx = await signer.signTransaction(tx);
      return provider.send("eth_sendRawTransaction", [signedTx]);
    }

    return provider.send(method, params);
  };
}
