import { existsSync, readFileSync } from "fs";

import { defaultMastercopyArtifactsFile } from "./internal/paths";
import deployMastercopy from "../deploy/deployMastercopy";

import { EIP1193Provider, MastercopyArtifact } from "../types";

export default async function ({
  mastercopyArtifactsFile = defaultMastercopyArtifactsFile(),
  provider,
}: {
  mastercopyArtifactsFile?: string;
  provider: EIP1193Provider;
}) {
  if (!existsSync(mastercopyArtifactsFile)) {
    throw new Error(`MastercopyArtifacts file not found at ${mastercopyArtifactsFile}`);
  }

  const allArtifacts = JSON.parse(
    readFileSync(mastercopyArtifactsFile, "utf8")
  );

  for (const contractName of Object.keys(allArtifacts)) {
    for (const [version, artifact] of Object.entries(
      allArtifacts[contractName]
    )) {
      const { contractName, factory, bytecode, constructorArgs, salt } =
        artifact as MastercopyArtifact;

      const { address, noop } = await deployMastercopy({
        factory,
        bytecode,
        constructorArgs,
        salt,
        provider,
        onStart: () => {
          console.log(`⏳ ${contractName}@${version}: Deployment starting...`);
        },
      });
      if (noop) {
        console.log(
          `🔄 ${contractName}@${version}: Already deployed at ${address}`
        );
      } else {
        console.log(
          `🚀 ${contractName}@${version}: Successfully deployed at ${address}`
        );
      }
    }
  }
}
