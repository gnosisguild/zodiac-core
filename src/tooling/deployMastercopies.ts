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
    throw new Error(
      `Mastercopy Artifacts File not found at ${mastercopyArtifactsFile}`
    );
  }

  const entries = Object.entries(
    JSON.parse(readFileSync(mastercopyArtifactsFile, "utf8"))
  );

  for (const [version, artifact] of entries) {
    const { bytecode, constructorArgs, salt } = artifact as MastercopyArtifact;

    const { address, noop } = await deploySingleton({
      bytecode,
      constructorArgs,
      salt,
      provider,
    });
    if (noop) {
      console.log(
        `version ${version}: Mastercopy already deployed at ${address}`
      );
    } else {
      console.log(`version ${version}: Deployed Mastercopy at ${address}`);
    }
  }
}
