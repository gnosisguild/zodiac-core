import { existsSync, readFileSync, writeFileSync } from "fs";
import semver from "semver";

import { address as erc2470FactoryAddress } from "../factory/erc2470Factory";
import predictSingletonAddress from "../encoding/predictSingletonAddress";

import { defaultMastercopyArtifactsFile } from "./internal/paths";

import { MastercopyArtifact } from "../types";
import { retrieve } from "./internal/verify";

export default async function reconstructMastercopyArtifact({
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
    await retrieve(address, apiUrlOrChainId, apiKey);

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
}
