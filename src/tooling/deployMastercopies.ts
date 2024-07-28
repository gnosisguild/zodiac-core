import { existsSync, readFileSync } from "fs";

import { defaultMastercopyArtifactsFile } from "./internal/paths";
import deploySingleton from "./deploySingleton";

import { EIP1193Provider, MastercopyArtifact } from "../types";

export default async function ({
  mastercopyArtifactsFile = defaultMastercopyArtifactsFile(),
  provider,
}: {
  mastercopyArtifactsFile?: string;
  provider: EIP1193Provider;
}) {
  if (!existsSync(mastercopyArtifactsFile)) {
    throw new Error(`Config not found at ${mastercopyArtifactsFile}`);
  }

  const entries = Object.entries(
    JSON.parse(readFileSync(mastercopyArtifactsFile, "utf8"))
  );

  for (const [version, artifact] of entries) {
    const { contractName, bytecode, constructorArgs, salt } =
      artifact as MastercopyArtifact;

    const { address, noop } = await deploySingleton({
      bytecode,
      constructorArgs,
      salt,
      provider,
      onStart: () => {
        console.log(`🕰️ ${contractName}@${version}: Deployment starting...`);
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
