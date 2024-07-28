import { existsSync, readFileSync, writeFileSync } from "fs";

import predictSingletonAddress from "../encoding/predictSingletonAddress";
import extractBuildArtifact from "./internal/extractBuildArtifact";
import {
  defaultBuildDir,
  defaultMastercopyArtifactsFile,
} from "./internal/paths";

import { MastercopyArtifact } from "../types";

export default function ({
  version,
  contractName,
  constructorArgs,
  salt,
  buildDirPath = defaultBuildDir(),
  mastercopyArtifactsFile = defaultMastercopyArtifactsFile(),
}: {
  version: string;
  contractName: string;
  constructorArgs: { types: any[]; values: any[] };
  salt: string;
  buildDirPath?: string;
  mastercopyArtifactsFile?: string;
}) {
  const buildArtifact = extractBuildArtifact(contractName, buildDirPath);

  const mastercopies = existsSync(mastercopyArtifactsFile)
    ? JSON.parse(readFileSync(mastercopyArtifactsFile, "utf8"))
    : {};

  if (mastercopies[version]) {
    console.warn(`Warning: overriding artifact for ${version}`);
  }

  const { bytecode, abi, ...rest } = buildArtifact;

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
    ...rest,
  };

  writeFileSync(
    mastercopyArtifactsFile,
    JSON.stringify({ ...mastercopies, [version]: entry }, null, 2),
    "utf8"
  );
}
