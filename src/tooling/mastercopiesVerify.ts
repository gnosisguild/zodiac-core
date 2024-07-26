import path from "path";
import { cwd } from "process";
import { readFileSync } from "fs";

import verify from "./internal/verify";

import { MastercopyArtifact } from "../types";

export default async function (
  apiUrl: string,
  apiKey: string,
  filePath = path.join(cwd(), "mastercopies.json")
) {
  const mastercopies = JSON.parse(readFileSync(filePath, "utf8"));

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
