import { verifySourceCode } from "./etherscan.js";

/**
 * Verifies a Mastercopy contract on an Etherscan-like block explorer.
 *
 * This function submits the source code and metadata of a Mastercopy contract to a block explorer
 * for verification. It interacts with the explorer's API using the provided API key and endpoint.
 *
 * @param {Object} params - The parameters required for verification.
 * @param {number} params.chainId - The chain ID.
 * @param {string} params.apiKey - The API key for authenticating requests to the block explorer.
 * @param {Object} params.artifact - The contract data required for verification.
 * @param {string} [params.apiUrl] - Optional custom API URL. If not provided, will use the default for the chain.
 *
 * @returns {Promise<{ address: string; noop: boolean }>} A promise that resolves to an object containing:
 * - `address` (string): The address of the verified Mastercopy contract.
 * - `noop` (boolean): A flag indicating if the contract was already verified.
 *
 * @throws {Error} Throws an error if the verification process fails or if the provided parameters are invalid.
 */
export default async function verifyMastercopy({
  chainId,
  apiKey,
  artifact,
  apiUrl,
}: {
  chainId: number;
  apiKey: string;
  artifact: {
    contractName: string;
    sourceName: string;
    compilerVersion: string;
    compilerInput: unknown;
    address: string;
    constructorArgs: {
      types: readonly string[];
      values: readonly unknown[];
    };
  };
  apiUrl?: string;
}): Promise<{
  address: string;
  noop: boolean;
}> {
  const { noop } = await verifySourceCode({
    ...artifact,
    chainId,
    apiKey,
    apiUrl,
  });

  return { address: artifact.address, noop };
}
