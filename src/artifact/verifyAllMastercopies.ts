import { existsSync, readFileSync } from "fs";

import { defaultMastercopyArtifactsFile } from "./internal/paths.js";
import { verifySourceCode } from "./internal/etherscan.js";

import { MastercopyArtifact } from "./types.js";

/**
 * Iterates through each entry in the mastercopy artifacts file and verifies the mastercopy on an Etherscan-compatible block explorer.
 *
 * @param {Object} params - The function parameters.
 * @param {number} params.chainId - The chain ID.
 * @param {string} params.apiKey - The API key used for verification.
 * @param {string} [params.mastercopyArtifactsFile=defaultMastercopyArtifactsFile()] - The path to the mastercopy artifacts file. Optional. Defaults to the result of `defaultMastercopyArtifactsFile()`.
 * @param {string} [params.apiUrl] - Optional custom API URL. If not provided, will use the default for the chain.
 *
 * @throws {Error} If the mastercopy artifacts file does not exist at the specified path.
 */
export default async function ({
  chainId,
  apiKey,
  mastercopyArtifactsFile = defaultMastercopyArtifactsFile(),
  apiUrl,
}: {
  chainId: number;
  apiKey: string;
  mastercopyArtifactsFile?: string;
  apiUrl?: string;
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
        chainId,
        apiKey,
        apiUrl,
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
