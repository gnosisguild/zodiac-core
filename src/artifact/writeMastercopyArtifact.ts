import { existsSync, readFileSync, writeFileSync } from "fs";
import semver from "semver";

import { address as erc2470FactoryAddress } from "../factory/erc2470Factory";
import predictSingletonAddress from "../encoding/predictSingletonAddress";

import {
  defaultBuildDir,
  defaultMastercopyArtifactsFile,
} from "./internal/paths";
import getBuildArtifact from "./internal/getBuildArtifact";

import { MastercopyArtifact } from "../types";

/**
 * Extracts and stores current Mastercopy contract information in the artifacts file.
 *
 * Optional fields such as `compilerInput` and `bytecode` can be provided externally or extracted from build artifacts.
 * It is recommended to provide `compilerInput`, as the internal code will include all generated sources in the verification, rather than just the sources reached by the current contract through graph traversal.
 *
 * @param {Object} params - The function parameters.
 * @param {string} params.contractVersion - The version of the contract.
 * @param {string} params.contractName - The name of the contract.
 * @param {Object} params.constructorArgs - The constructor arguments.
 * @param {any[]} params.constructorArgs.types - The types of the constructor arguments.
 * @param {any[]} params.constructorArgs.values - The values of the constructor arguments.
 * @param {string} params.salt - A 32-byte value used for mastercopy deployment.
 * @param {string} [params.factory=erc2470FactoryAddress] - The address of the factory contract used to deploy the mastercopy. Optional.
 * @param {string} [params.bytecode] - The bytecode of the contract. Optional.
 * @param {any} [params.compilerInput] - The minimal compiler input. Optional.
 * @param {string} [params.buildDirPath=defaultBuildDir()] - The path to the build directory. Optional.
 * @param {string} [params.mastercopyArtifactsFile=defaultMastercopyArtifactsFile()] - The path to the mastercopy artifacts file. Optional.
 */
export default function extractAndWriteMastercopyArtifact({
  contractVersion,
  contractName,
  compilerInput: minimalCompilerInput,
  factory = erc2470FactoryAddress,
  bytecode,
  constructorArgs,
  salt,
  buildDirPath = defaultBuildDir(),
  mastercopyArtifactsFile = defaultMastercopyArtifactsFile(),
}: {
  contractVersion: string;
  contractName: string;
  factory?: string;
  bytecode?: string;
  constructorArgs: { types: any[]; values: any[] };
  salt: string;
  compilerInput?: any;
  buildDirPath?: string;
  mastercopyArtifactsFile?: string;
}) {
  const buildArtifact = getBuildArtifact(contractName, buildDirPath);

  const mastercopies = existsSync(mastercopyArtifactsFile)
    ? JSON.parse(readFileSync(mastercopyArtifactsFile, "utf8"))
    : {};

  if (mastercopies[contractVersion]) {
    console.warn(`Warning: overriding artifact for ${contractVersion}`);
  }

  const mastercopyArtifact: MastercopyArtifact = {
    contractName,
    sourceName: buildArtifact.sourceName,
    contractVersion,
    compilerVersion: buildArtifact.compilerVersion,
    factory,
    address: predictSingletonAddress({
      factory,
      bytecode: bytecode || buildArtifact.bytecode,
      constructorArgs,
      salt,
    }),
    bytecode: bytecode || buildArtifact.bytecode,
    constructorArgs,
    salt,
    abi: buildArtifact.abi,
    compilerInput: minimalCompilerInput || buildArtifact.compilerInput,
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
}
