import { existsSync, readFileSync, writeFileSync } from "fs";

import { address as erc2470FactoryAddress } from "../factory/erc2470Factory";
import predictSingletonAddress from "../encoding/predictSingletonAddress";

import {
  defaultBuildDir,
  defaultMastercopyArtifactsFile,
} from "./internal/paths";
import getBuildArtifact from "./internal/getBuildArtifact";

import { MastercopyArtifact } from "../types";

/**
 * Extracts and stores mastercopy contract information in the artifacts file.
 *
 * For optional fields like `compilerInput` and `bytecode`, these can either be provided externally or extracted internally from build artifacts. 
 * The `compilerInput` is expected to be provided, since the internal code will include every generated source in the verification, instead of only including sources reached by the current contract through graph traversal.
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
export default function extractMastercopy({
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

  writeFileSync(
    mastercopyArtifactsFile,
    JSON.stringify(
      {
        ...mastercopies,
        [contractName]: {
          ...(mastercopies[contractName] || {}),
          [contractVersion]: mastercopyArtifact,
        },
      },
      null,
      2
    ),
    "utf8"
  );
}
