import { existsSync, writeFileSync } from "fs";

import { address as erc2470FactoryAddress } from "../factory/erc2470Factory.js";
import predictSingletonAddress from "../encoding/predictSingletonAddress.js";

import { defaultBuildDir, defaultMastercopyFile } from "./internal/paths.js";
import getBuildArtifact from "./internal/getBuildArtifact.js";
import linkBuildArtifact, {
  LibraryLinks,
} from "./internal/linkBuildArtifact.js";

import { MastercopyArtifact } from "./types.js";

/**
 * Extracts and stores one Mastercopy artifact from the current contract build.
 *
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
 * @param {any} [params.compilerInput] - The minimal compiler input. Optional.
 * @param {Record<string, string> | MastercopyArtifact[]} [params.libraries] - Library addresses or artifacts used to link the build artifact. Optional.
 * @param {string} [params.buildDirPath=defaultBuildDir()] - The path to the build directory. Optional.
 * @param {string} [params.mastercopyFile=defaultMastercopyFile()] - The path to the mastercopy artifact file. Optional.
 */
export default function writeMastercopyFromBuild({
  contractVersion,
  contractName,
  compilerInput: minimalCompilerInput,
  factory = erc2470FactoryAddress,
  constructorArgs,
  salt,
  libraries,
  buildDirPath = defaultBuildDir(),
  mastercopyFile = defaultMastercopyFile(),
}: {
  contractVersion: string;
  contractName: string;
  factory?: string;
  constructorArgs: { types: any[]; values: any[] };
  salt: string;
  compilerInput?: any;
  libraries?: LibraryLinks;
  buildDirPath?: string;
  mastercopyFile?: string;
}): MastercopyArtifact {
  const buildArtifact = getBuildArtifact(contractName, buildDirPath);

  if (existsSync(mastercopyFile)) {
    console.warn(
      `Warning: overriding mastercopy artifact at ${mastercopyFile}`
    );
  }

  const artifact = linkBuildArtifact({
    artifact: buildArtifact,
    contractVersion,
    minimalCompilerInput,
    libraries,
  });

  const mastercopyArtifact: MastercopyArtifact = {
    contractName,
    sourceName: buildArtifact.sourceName,
    contractVersion,
    compilerVersion: buildArtifact.compilerVersion,
    factory,
    address: predictSingletonAddress({
      factory,
      bytecode: artifact.bytecode,
      constructorArgs,
      salt,
    }),
    bytecode: artifact.bytecode,
    constructorArgs,
    salt,
    abi: buildArtifact.abi,
    compilerInput: artifact.compilerInput,
  };

  writeFileSync(
    mastercopyFile,
    JSON.stringify(mastercopyArtifact, null, 2),
    "utf8"
  );

  return mastercopyArtifact;
}
