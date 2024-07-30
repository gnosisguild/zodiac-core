import { readFileSync } from "fs";

import verify from "./tooling/internal/verify";
import { defaultMastercopyArtifactsFile } from "./tooling/internal/paths";

import { MastercopyArtifact } from "./types";

export default async function ({
  apiUrl,
  apiKey,
  mastercopiesFilePath = defaultMastercopyArtifactsFile(),
}: {
  apiUrl: string;
  apiKey: string;
  mastercopiesFilePath?: string;
}) {
  const mastercopies = JSON.parse(readFileSync(mastercopiesFilePath, "utf8"));

  for (const [version, artifact] of Object.entries(mastercopies)) {
    const { noop } = await verify(
      artifact as MastercopyArtifact,
      apiUrl,
      apiKey
    );

    const { contractName, contractAddress } = artifact as MastercopyArtifact;

    if (noop) {
      console.log(
        `🔄 ${contractName}@${version}: Already verified at ${contractAddress}`
      );
    } else {
      console.log(
        `🚀 ${contractName}@${version}: Successfully verified at ${contractAddress}`
      );
    }
  }
}
