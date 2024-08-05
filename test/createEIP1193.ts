import { Signer } from "ethers";
import { EIP1193Provider } from "../src/types";

/**
 * Wraps an EIP1193Provider with a Signer to intercept eth_sendTransaction requests.
 * If the method is eth_sendTransaction, the transaction is signed and sent by the provided Signer.
 * Otherwise, the request is forwarded to the original provider.
 *
 * @param {EIP1193Provider} provider - The original EIP1193 provider to wrap.
 * @param {Signer} signer - The Signer to use for signing transactions.
 * @returns {EIP1193Provider} A new EIP1193 provider that wraps the original provider and signer.
 */
export default function (
  provider: EIP1193Provider,
  signer: Signer
): EIP1193Provider {
  return {
    /**
     * Handles requests to the provider.
     * Intercepts eth_sendTransaction requests to use the provided Signer for signing the transaction.
     *
     * @param {object} request - The request object containing the method and parameters.
     * @param {string} request.method - The JSON-RPC method.
     * @param {Array<any>} request.params - The parameters for the JSON-RPC method.
     * @returns {Promise<any>} The result of the request.
     */
    request: async ({ method, params }) => {
      if (method === "eth_sendTransaction") {
        const { hash } = await signer.sendTransaction((params as any[])[0]);
        return hash;
      }

      return provider.request({ method, params });
    },
  };
}
