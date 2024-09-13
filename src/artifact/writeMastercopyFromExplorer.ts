import { existsSync, readFileSync, writeFileSync } from "fs";
import semver from "semver";

import { address as erc2470FactoryAddress } from "../factory/erc2470Factory";
import predictSingletonAddress from "../encoding/predictSingletonAddress";

import { defaultMastercopyArtifactsFile } from "./internal/paths";
import { getSourceCode } from "./internal/etherscan";

import { MastercopyArtifact } from "../types";

/**
 * Extracts and stores the Mastercopy result from a contract deployed on the blockchain by querying an Etherscan-like explorer.
 *
 * This method fetches the source code, ABI, and other relevant information of the contract from an explorer, then predicts the address of the singleton and stores the relevant data in the artifacts file.
 *
 * @param {Object} params - The function parameters.
 * @param {string} params.contractVersion - The version of the contract.
 * @param {string} [params.factory=erc2470FactoryAddress] - The address of the factory contract used to deploy the mastercopy. Optional.
 * @param {string} params.address - The address of the deployed contract.
 * @param {string} params.bytecode - The bytecode of the contract.
 * @param {Object} params.constructorArgs - The constructor arguments.
 * @param {any[]} params.constructorArgs.types - The types of the constructor arguments.
 * @param {any[]} params.constructorArgs.values - The values of the constructor arguments.
 * @param {string} params.salt - A 32-byte value used for mastercopy deployment.
 * @param {string} params.apiUrlOrChainId - The API URL or Chain ID of the explorer service.
 * @param {string} params.apiKey - The API key for accessing the explorer service.
 * @param {string} [params.mastercopyArtifactsFile=defaultMastercopyArtifactsFile()] - The path to the mastercopy artifacts file. Optional.
 *
 * @returns {Promise<void>} - This function does not return a value but writes the mastercopy artifact to a file.
 */
export default async function writeMastercopyFromExplorer({
  contractVersion,
  factory = erc2470FactoryAddress,
  address,
  bytecode,
  constructorArgs,
  salt,
  apiUrlOrChainId,
  apiKey,
  mastercopyArtifactsFile = defaultMastercopyArtifactsFile(),
}: {
  contractVersion: string;
  factory?: string;
  address: string;
  bytecode: string;
  constructorArgs: { types: any[]; values: any[] };
  salt: string;
  apiUrlOrChainId: string;
  apiKey: string;
  mastercopyArtifactsFile?: string;
}) {
  const { contractName, sourceName, compilerVersion, compilerInput, abi } =
    await getSourceCode({ address, apiUrlOrChainId, apiKey });

  const mastercopies = existsSync(mastercopyArtifactsFile)
    ? JSON.parse(readFileSync(mastercopyArtifactsFile, "utf8"))
    : {};

  if (mastercopies[contractVersion]) {
    console.warn(`Warning: overriding artifact for ${contractVersion}`);
  }

  const mastercopyArtifact: MastercopyArtifact = {
    contractName,
    sourceName,
    contractVersion,
    compilerVersion,
    factory,
    address: predictSingletonAddress({
      factory,
      bytecode,
      constructorArgs,
      salt,
    }),
    bytecode,
    constructorArgs,
    salt,
    abi,
    compilerInput,
  };

  const nextMastercopies = {
    ...mastercopies,
    [contractName]: {
      ...(mastercopies[contractName] || {}),
      [contractVersion]: mastercopyArtifact,
    },
  };

  let sortedMastercopies: Record<
    string,
    Record<string, MastercopyArtifact>
  > = {};

  for (const name of Object.keys(nextMastercopies)) {
    sortedMastercopies[name] = {};
    const versions = semver.sort(Object.keys(nextMastercopies[name]));
    for (const version of versions) {
      sortedMastercopies[name][version] = nextMastercopies[name][version];
    }
  }

  writeFileSync(
    mastercopyArtifactsFile,
    JSON.stringify(sortedMastercopies, null, 2),
    "utf8"
  );

  return mastercopyArtifact;
}
