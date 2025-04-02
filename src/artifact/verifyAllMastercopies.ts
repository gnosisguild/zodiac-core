import { existsSync, readFileSync } from "fs";

import { defaultMastercopyArtifactsFile } from "./internal/paths";
import { verifySourceCode } from "./internal/etherscan";

import { MastercopyArtifact } from "../types";

/**
 * Iterates through each entry in the mastercopy artifacts file and verifies the mastercopy on an Etherscan-compatible block explorer.
 *
 * @param {Object} params - The function parameters.
 * @param {string} params.apiUrlOrChainId - The API URL used for verification. If a chain id is provided, the function will attempt to resolve it to a valid explorer URL.
 * @param {string} params.apiKey - The API key used for verification.
 * @param {string} [params.mastercopyArtifactsFile=defaultMastercopyArtifactsFile()] - The path to the mastercopy artifacts file. Optional. Defaults to the result of `defaultMastercopyArtifactsFile()`.
 * @param {Object} [customChainConfig] - An optional custom chain configuration object. This object should include:
 *   - `network` (string): The name of the network.
 *   - `chainId` (number): The chain ID.
 *   - `urls` (object): An object containing:
 *       - `apiURL` (string): The API endpoint URL of the block explorer.
 *       - `browserURL` (string): The browser URL of the block explorer.
 *
 * @throws {Error} If the mastercopy artifacts file does not exist at the specified path.
 */
export default async function ({
  apiUrlOrChainId,
  apiKey,
  mastercopyArtifactsFile = defaultMastercopyArtifactsFile(),
  customChainConfig,
}: {
  apiUrlOrChainId: string;
  apiKey: string;
  mastercopyArtifactsFile?: string;
  customChainConfig?: {
    network: string;
    chainId: number;
    urls: { apiURL: string; browserURL: string };
  };
}) {
  if (!existsSync(mastercopyArtifactsFile)) {
    throw new Error(
      `MastercopyArtifacts file not found at ${mastercopyArtifactsFile}`
    );
  }

  const allArtifacts = JSON.parse(
    readFileSync(mastercopyArtifactsFile, "utf8")
  );

  for (const contractName of Object.keys(allArtifacts)) {
    for (const [version, artifact] of Object.entries(
      allArtifacts[contractName]
    )) {
      const { noop } = await verifySourceCode({
        ...(artifact as MastercopyArtifact),
        apiUrlOrChainId,
        apiKey,
        customChainConfig,
      });

      const { contractName, address } = artifact as MastercopyArtifact;

      if (noop) {
        console.log(
          `🔄 ${contractName}@${version}: Already verified at ${address}`
        );
      } else {
        console.log(
          `🚀 ${contractName}@${version}: Successfully verified at ${address}`
        );
      }
    }
  }
}
