import path from "path";
import { cwd } from "process";
import { readFileSync } from "fs";

import deployMastercopy from "./deployMastercopy";

import { EIP1193Provider, MastercopyArtifact } from "../types";

export default async function ({
  provider,
  mastercopiesFilePath = path.join(cwd(), "mastercopies.json"),
}: {
  provider: EIP1193Provider;
  mastercopiesFilePath?: string;
}) {
  const mastercopies = JSON.parse(readFileSync(mastercopiesFilePath, "utf8"));

  for (const [version, artifact] of Object.entries(mastercopies)) {
    const { bytecode, constructorArgs, salt } = artifact as MastercopyArtifact;

    const { address, noop } = await deployMastercopy(
      { bytecode, constructorArgs, salt },
      provider
    );
    if (noop) {
      console.log(
        `version ${version}: Mastercopy already deployed at ${address}`
      );
    } else {
      console.log(`version ${version}: Deployed Mastercopy at at ${address}`);
    }
  }
}
