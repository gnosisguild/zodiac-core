import { MastercopyArtifact } from "../types";
import { verifySourceCode } from "../artifact/internal/etherscan";

/**
 * Pauses the execution for a specified amount of time.
 *
 * @param {number} ms - The number of milliseconds to wait.
 * @returns {Promise<void>} A promise that resolves after the specified delay.
 */
const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Verifies a Mastercopy contract on an Etherscan-like block explorer.
 *
 * This function submits the source code and metadata of a Mastercopy contract to a block explorer
 * for verification. It interacts with the explorer's API
 * using the provided API key and endpoint. A debounced timer of 500 milliseconds
 * is added between each verification to prevent rate-limiting issues.
 *
 * @param {Object} params - The parameters required for verification.
 * @param {string} params.apiUrlOrChainId - The base URL of the block explorer's API or the chain ID.
 * @param {string} params.apiKey - The API key for authenticating requests to the block explorer.
 * @param {MastercopyArtifact} params.artifact - The Mastercopy artifact containing the contract's address, source code, ABI, and other metadata.
 *
 * @returns {Promise<{ address: string; noop: boolean }>} A promise that resolves to an object containing:
 * - `address` (string): The address of the verified Mastercopy contract.
 * - `noop` (boolean): A flag indicating if the contract was already verified.
 *
 * @throws {Error} Throws an error if the verification process fails or if the provided parameters are invalid.
 */
export default async function verifyMastercopy({
  apiUrlOrChainId,
  apiKey,
  artifact,
}: {
  apiUrlOrChainId: string;
  apiKey: string;
  artifact: MastercopyArtifact;
}): Promise<{
  address: string;
  noop: boolean;
}> {
  await sleep(500);

  const { noop } = await verifySourceCode({
    ...artifact,
    apiUrlOrChainId,
    apiKey,
  });

  return { address: artifact.address, noop };
}
