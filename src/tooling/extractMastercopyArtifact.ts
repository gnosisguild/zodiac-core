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
    console.warn(`Warning: overriding previous artifact for ${version}`);
  }

  const entry: MastercopyArtifact = {
    ...buildArtifact,
    constructorArgs,
    salt,
    contractAddress: predictSingletonAddress({
      bytecode: buildArtifact.bytecode,
      constructorArgs,
      salt,
    }),
  };

  writeFileSync(
    mastercopyArtifactsFile,
    JSON.stringify({ ...mastercopies, [version]: entry }, null, 2),
    "utf8"
  );
}
