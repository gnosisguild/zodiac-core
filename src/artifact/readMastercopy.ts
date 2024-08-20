import assert from "assert";
import semver from "semver";
import { existsSync, readFileSync } from "fs";

import { defaultMastercopyArtifactsFile } from "./internal/paths";

import { MastercopyArtifact } from "../types";

/**
 * Extracts and returns the Mastercopy artifact information from the artifacts file.
 *
 * This function retrieves and returns the artifact information for a specified contract. If the contract version is not provided, the latest version will be used automatically.
 *
 * @param {Object} params - The function parameters.
 * @param {string} params.contractName - The name of the contract.
 * @param {string} [params.contractVersion] - The version of the contract. If not provided, the latest version will be used.
 * @param {string} [params.mastercopyArtifactsFile=defaultMastercopyArtifactsFile()] - The path to the mastercopy artifacts file. Optional.
 * @returns {MastercopyArtifact} The Mastercopy artifact information.
 */
export default function readMastercopy({
  contractName,
  contractVersion,
  mastercopyArtifactsFile = defaultMastercopyArtifactsFile(),
}: {
  contractName: string;
  contractVersion?: string;
  mastercopyArtifactsFile?: string;
}): MastercopyArtifact | null {
  if (!existsSync(mastercopyArtifactsFile)) {
    throw new Error(
      `MastercopyArtifacts file not found at ${mastercopyArtifactsFile}`
    );
  }

  const mastercopies = JSON.parse(
    readFileSync(mastercopyArtifactsFile, "utf8")
  );

  if (!mastercopies[contractName]) {
    return null;
  }

  if (!contractVersion) {
    contractVersion = findLatestVersion(mastercopies[contractName]);
  }

  return mastercopies[contractName][contractVersion] || null;
}

function findLatestVersion(mastercopies: JSON) {
  const versions = Object.keys(mastercopies);
  if (versions.length == 0) {
    throw new Error(`MastercopyArtifacts file: no Entries`);
  }

  const invalid = versions.find((version) => !semver.valid(version));
  if (invalid) {
    throw new Error(`MastercopyArtifacts file: not a valid version ${invalid}`);
  }

  const [latest] = versions.sort(semver.compare).reverse();
  assert(semver.valid(latest));
  return latest;
}
