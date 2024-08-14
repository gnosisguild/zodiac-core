import { existsSync, readFileSync } from "fs";

import { defaultMastercopyArtifactsFile } from "./internal/paths";
import deployMastercopy from "../deploy/deployMastercopy";

import { EIP1193Provider, MastercopyArtifact } from "../types";

/**
 * Iterates through each entry in the mastercopy artifacts file and deploys each mastercopy using the passed in provider.
 * Entries that are already deployed will result in no operation.
 *
 * @param {Object} params - The function parameters.
 * @param {string} params.mastercopyArtifactsFile - The path to the mastercopy artifacts file.
 * @param {EIP1193Provider} params.provider - The EIP1193 compliant provider to interact with the blockchain.
 *
 * @throws {Error} If the mastercopy artifacts file does not exist at the specified path.
 */
export default async function ({
  mastercopyArtifactsFile = defaultMastercopyArtifactsFile(),
  provider,
}: {
  mastercopyArtifactsFile?: string;
  provider: EIP1193Provider;
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
