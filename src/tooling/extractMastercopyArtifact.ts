import { existsSync, readFileSync, writeFileSync } from "fs";

import predictSingletonAddress from "../encoding/predictSingletonAddress";
import getBuildArtifact from "./internal/getBuildArtifact";
import {
  defaultBuildDir,
  defaultMastercopyArtifactsFile,
} from "./internal/paths";

import { MastercopyArtifact } from "../types";

export default function ({
  contractVersion,
  contractName,
  compilerInput: minimalCompilerInput,
  constructorArgs,
  salt,
  buildDirPath = defaultBuildDir(),
  mastercopyArtifactsFile = defaultMastercopyArtifactsFile(),
}: {
  contractVersion: string;
  contractName: string;
  constructorArgs: { types: any[]; values: any[] };
  salt: string;
  compilerInput: any;
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

  const { bytecode, abi, compilerInput, ...rest } = buildArtifact;

  const entry: MastercopyArtifact = {
    contractAddress: predictSingletonAddress({
      bytecode: buildArtifact.bytecode,
      constructorArgs,
      salt,
    }),
    bytecode,
    constructorArgs,
    salt,
    abi,
    compilerInput: minimalCompilerInput || compilerInput,
    ...rest,
  };

  writeFileSync(
    mastercopyArtifactsFile,
    JSON.stringify({ ...mastercopies, [contractVersion]: entry }, null, 2),
    "utf8"
  );
}
