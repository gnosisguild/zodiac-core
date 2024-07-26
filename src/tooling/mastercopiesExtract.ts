import path from "path";
import { cwd } from "process";
import { existsSync, readFileSync, writeFileSync } from "fs";

import { predictMastercopyAddress } from "../populateDeployMastercopy";
import extractBuildArtifact from "./internal/extractBuildArtifact";

import { MastercopyArtifact } from "../types";

export default function ({
  version,
  contractName,
  constructorArgs,
  salt,
  buildDirPath = path.join(cwd(), "build", "artifacts", "contracts"),
  mastercopiesFilePath = path.join(cwd(), "mastercopies.json"),
}: {
  version: string;
  contractName: string;
  constructorArgs: { types: any[]; values: any[] };
  salt: string;
  buildDirPath?: string;
  mastercopiesFilePath?: string;
}) {
  const buildArtifact = extractBuildArtifact(contractName, buildDirPath);

  const mastercopies = existsSync(mastercopiesFilePath)
    ? JSON.parse(readFileSync(mastercopiesFilePath, "utf8"))
    : {};

  if (mastercopies[version]) {
    console.warn(`Warning: overriding previous artifact for ${version}`);
  }

  const entry: MastercopyArtifact = {
    ...buildArtifact,
    constructorArgs,
    salt,
    contractAddress: predictMastercopyAddress({
      bytecode: buildArtifact.bytecode,
      constructorArgs,
      salt,
    }),
  };

  writeFileSync(
    mastercopiesFilePath,
    JSON.stringify({ ...mastercopies, [version]: entry }, null, 2),
    "utf8"
  );
}
