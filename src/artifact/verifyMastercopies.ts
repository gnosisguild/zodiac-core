import { existsSync, readFileSync } from "fs";

import { defaultMastercopyArtifactsFile } from "./internal/paths";
import verify from "./internal/verify";

import { MastercopyArtifact } from "../types";

/**
 * Verifies mastercopy contracts specified in the artifacts file using the provided API url and key.
 *
 * @param {Object} params - The function parameters.
 * @param {string} params.apiUrl - The API URL used for verification. If a chainId if provided, we will try to resolve to a valid explorer URL.
 * @param {string} params.apiKey - The API key used for verification.
 * @param {string} [params.mastercopyArtifactsFile=defaultMastercopyArtifactsFile()] - The path to the mastercopy artifacts file. Optional.
 *
 * @throws {Error} If the mastercopy artifacts file does not exist at the specified path.
 */
export default async function ({
  apiUrl,
  apiKey,
  mastercopyArtifactsFile = defaultMastercopyArtifactsFile(),
}: {
  apiUrl: string;
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
        apiUrl,
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
