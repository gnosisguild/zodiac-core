import { readFileSync } from "fs";

import { defaultMastercopyArtifactsFile } from "./internal/paths";
import verify from "./internal/verify";

import { MastercopyArtifact } from "../types";

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
