import { existsSync, readFileSync } from "fs";

import { MastercopyArtifact } from "../types";

import { defaultMastercopyArtifactsFile } from "./internal/paths";
import verify from "./internal/verify";

/**
 * Iterates through each entry in the mastercopy artifacts file and verifies the mastercopy on an Etherscan-compatible block explorer.
 *
 * @param {Object} params - The function parameters.
 * @param {string} params.apiUrlOrChainId - The API URL used for verification. If a chain id is provided, the function will attempt to resolve it to a valid explorer URL.
 * @param {string} params.apiKey - The API key used for verification.
 * @param {string} [params.mastercopyArtifactsFile=defaultMastercopyArtifactsFile()] - The path to the mastercopy artifacts file. Optional. Defaults to the result of `defaultMastercopyArtifactsFile()`.
 *
 * @throws {Error} If the mastercopy artifacts file does not exist at the specified path.
 */
export default async function ({
  apiUrlOrChainId,
  apiKey,
  mastercopyArtifactsFile = defaultMastercopyArtifactsFile(),
}: {
  apiUrlOrChainId: string;
  apiKey: string;
  mastercopyArtifactsFile?: string;
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
      const { noop } = await verify(
        artifact as MastercopyArtifact,
        apiUrlOrChainId,
        apiKey
      );

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
