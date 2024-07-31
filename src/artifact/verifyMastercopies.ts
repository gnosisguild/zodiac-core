import { existsSync, readFileSync } from "fs";

import { defaultMastercopyArtifactsFile } from "./internal/paths";
import verify from "./internal/verify";

import { MastercopyArtifact } from "../types";

export default async function ({
  apiUrl,
  apiKey,
  mastercopyArtifactsFile = defaultMastercopyArtifactsFile(),
}: {
  apiUrl: string;
  apiKey: string;
  mastercopyArtifactsFile?: string;
}) {
  if (!existsSync(mastercopyArtifactsFile)) {
    throw new Error(
      `MastercopyArtifacts file not found at ${mastercopyArtifactsFile}`
    );
  }

  const allArtifacts = JSON.parse(
    readFileSync(mastercopyArtifactsFile, "utf8")
  );

  for (const contractName of Object.keys(allArtifacts)) {
    for (const [version, artifact] of Object.entries(
      allArtifacts[contractName]
    )) {
      const { noop } = await verify(
        artifact as MastercopyArtifact,
        apiUrl,
        apiKey
      );

      const { contractName, address } = artifact as MastercopyArtifact;

      if (noop) {
        console.log(
          `🔄 ${contractName}@${version}: Already verified at ${address}`
        );
      } else {
        console.log(
          `🚀 ${contractName}@${version}: Successfully verified at ${address}`
        );
      }
    }
  }
}
