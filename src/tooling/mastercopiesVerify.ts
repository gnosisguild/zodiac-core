import path from "path";
import { cwd } from "process";
import { readFileSync } from "fs";

import verify from "./internal/verify";

import { MastercopyArtifact } from "../types";

export default async function ({
  apiUrl,
  apiKey,
  mastercopiesFilePath = path.join(cwd(), "mastercopies.json"),
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

    if (noop) {
      console.log(`version ${version}: Mastercopy already verified`);
    } else {
      console.log(`version ${version}: Successfully verified Mastercopy`);
    }
  }
}
