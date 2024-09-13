import assert from "assert";
import { isAddress } from "ethers";

import { BuildArtifact, MastercopyArtifact } from "../../types";

/**
 * Resolves library links in a build artifact
 *
 */
export default function linkBuildArtifact({
  artifact,
  contractVersion,
  minimalCompilerInput,
  mastercopies,
}: {
  artifact: BuildArtifact;
  contractVersion: string;
  minimalCompilerInput?: string;
  mastercopies: Record<string, Record<string, MastercopyArtifact>>;
}): BuildArtifact {
  const bytecode = linkBytecode(artifact, contractVersion, mastercopies);
  const compilerInput = linkCompilerInput(
    artifact,
    contractVersion,
    minimalCompilerInput || artifact.compilerInput,
    mastercopies
  );

  return {
    ...artifact,
    bytecode,
    compilerInput,
  };
}

/**
 * Replaces library references in the bytecode with actual deployed addresses.
 *
 * This function scans the bytecode and replaces placeholder references
 * to libraries with their actual on-chain addresses. It ensures that
 * the library addresses are valid and properly formatted.
 *
 * @param {string} bytecode - The bytecode that may contain library references.
 * @param {Record<string, any>} linkReferences - References to libraries, as returned by the compiler.
 * @param {Record<string, string>} libraryAddresses - A map of library names to their deployed addresses.
 * @returns {string} - The updated bytecode with library references replaced by actual addresses.
 *
 * @throws {Error} - Throws if a library address is missing or incorrectly formatted.
 */
function linkBytecode(
  artifact: BuildArtifact,
  contractVersion: string,
  mastercopies: Record<string, Record<string, MastercopyArtifact>>
): string {
  let bytecode = artifact.bytecode;

  for (const libraryPath of Object.keys(artifact.linkReferences)) {
    for (const libraryName of Object.keys(
      artifact.linkReferences[libraryPath]
    )) {
      console.log(`libraryPath ${libraryPath} libraryName ${libraryName}`);

      if (
        !mastercopies[libraryName] ||
        !mastercopies[libraryName][contractVersion]
      ) {
        throw new Error(
          `Could not link ${libraryName} for ${artifact.contractName}`
        );
      }

      let { address: libraryAddress } =
        mastercopies[libraryName][contractVersion];

      assert(isAddress(libraryAddress));

      for (const { length, start: offset } of artifact.linkReferences[
        libraryPath
      ][libraryName]) {
        assert(length == 20);

        // the offset is in bytes, and does not account for the trailing 0x
        const left = 2 + offset * 2;
        const right = left + length * 2;

        bytecode = `${bytecode.slice(0, left)}${libraryAddress.slice(2).toLowerCase()}${bytecode.slice(right)}`;

        console.log(
          `Replaced library reference at ${offset} with address ${libraryAddress}`
        );
      }
    }
  }

  return bytecode;
}

function linkCompilerInput(
  artifact: BuildArtifact,
  contractVersion: string,
  compilerInput: any,
  mastercopies: Record<string, Record<string, MastercopyArtifact>>
): any {
  const result = { ...compilerInput };
  for (const libraryPath of Object.keys(artifact.linkReferences)) {
    for (const libraryName of Object.keys(
      artifact.linkReferences[libraryPath]
    )) {
      const libraryAddress =
        mastercopies[libraryName]?.[contractVersion]?.address;
      if (!libraryAddress) {
        continue;
      }

      assert(isAddress(libraryAddress));

      result.settings = {
        ...result.settings,
        libraries: {
          ...result.settings.libraries,
          [libraryPath]: { [libraryName]: libraryAddress },
        },
      };
    }
  }

  return result;
}
