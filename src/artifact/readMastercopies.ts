import assert from "assert";
import semver from "semver";
import { existsSync, readFileSync } from "fs";

import { defaultMastercopyArtifactsFile } from "./internal/paths";
import { MastercopyArtifact } from "../types";

/**
 * Extracts and returns Mastercopy artifact information from the specified artifacts file.
 *
 * This function allows filtering of artifacts based on the contract name and version.
 * If no filter is provided, it returns all artifacts. When `latest` is specified as the
 * contract version, only the highest version of each artifact is returned.
 *
 * @param {Object} params - The parameters for filtering the artifacts.
 * @param {string} [params.contractName] - [Optional] The name of the contract to filter by. If not provided, all contract names are considered.
 * @param {string} [params.contractVersion] - [Optional] The version of the contract to filter by. If set to `"latest"`, only the most recent version of each contract is returned. If not provided, all versions are considered.
 * @param {string} [params.mastercopyArtifactsFile=defaultMastercopyArtifactsFile()] - The path to the mastercopy artifacts file. Defaults to the path returned by `defaultMastercopyArtifactsFile()`.
 * @returns {MastercopyArtifact[]} An array of Mastercopy artifacts matching the specified filters.
 *
 * @throws {Error} Throws an error if the specified artifacts file does not exist.
 *
 * @example
 * // Returns all artifacts
 * const allArtifacts = enumMastercopies({});
 *
 * @example
 * // Returns artifacts for a specific contract name
 * const specificContractArtifacts = enumMastercopies({ contractName: 'MyContract' });
 *
 * @example
 * // Returns artifacts for a specific contract name and version
 * const specificVersionArtifacts = enumMastercopies({ contractName: 'MyContract', contractVersion: '1.0.0' });
 *
 * @example
 * // Returns the latest version of all contracts
 * const latestVersionArtifacts = enumMastercopies({ contractVersion: 'latest' });
 */
export default function readMastercopies({
  contractName,
  contractVersion,
  mastercopyArtifactsFile = defaultMastercopyArtifactsFile(),
}: {
  contractName?: string;
  contractVersion?: string;
  mastercopyArtifactsFile?: string;
} = {}): MastercopyArtifact[] {
  if (!existsSync(mastercopyArtifactsFile)) {
    throw new Error(
      `MastercopyArtifacts file not found at ${mastercopyArtifactsFile}`
    );
  }

  const mastercopies = JSON.parse(
    readFileSync(mastercopyArtifactsFile, "utf8")
  );

  const result = [] as MastercopyArtifact[];

  for (const nameKey of Object.keys(mastercopies)) {
    const _contractVersion =
      contractVersion == "latest"
        ? findLatestVersion({ contractName: nameKey, mastercopies })
        : contractVersion;

    for (const versionKey of Object.keys(mastercopies[nameKey])) {
      if (
        filterByContractName({ contractName: nameKey, filter: contractName }) &&
        filterByContractVersion({
          contractVersion: versionKey,
          filter: _contractVersion,
        })
      ) {
        result.push(mastercopies[nameKey][versionKey]);
      }
    }
  }

  return result;
}

function filterByContractName({
  contractName,
  filter,
}: {
  contractName: string;
  filter?: string;
}) {
  if (typeof filter != "string") {
    return true;
  }

  return contractName.trim().toLowerCase() == filter.trim().toLowerCase();
}

function filterByContractVersion({
  contractVersion,
  filter,
}: {
  contractVersion: string;
  filter?: string;
}) {
  if (typeof filter != "string") {
    return true;
  }

  if (!semver.valid(contractVersion)) {
    throw new Error(`Invalid Artifact Version ${contractVersion}`);
  }

  if (!semver.valid(filter)) {
    throw new Error(`Invalid Filter Version ${filter}`);
  }

  return semver.satisfies(contractVersion, filter);
}

function findLatestVersion({
  contractName,
  mastercopies,
}: {
  contractName: string;
  mastercopies: Record<string, JSON>;
}) {
  const versions = Object.keys(mastercopies[contractName] as JSON);
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
