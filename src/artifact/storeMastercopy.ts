import { existsSync, readFileSync, writeFileSync } from "fs";

import { address as erc2470FactoryAddress } from "../factory/erc2470Factory";
import predictSingletonAddress from "../encoding/predictSingletonAddress";

import {
  defaultBuildDir,
  defaultMastercopyArtifactsFile,
} from "./internal/paths";
import getBuildArtifact from "./internal/getBuildArtifact";

import { MastercopyArtifact } from "../types";

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
