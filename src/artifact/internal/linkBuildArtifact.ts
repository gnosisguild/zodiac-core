import assert from "assert";
import { isAddress } from "ethers";

import { BuildArtifact, MastercopyArtifact } from "../types.js";

export type LibraryLinks = Record<string, string> | MastercopyArtifact[];

/**
 * Resolves library links in a build artifact
 *
 */
export default function linkBuildArtifact({
  artifact,
  contractVersion,
  minimalCompilerInput,
  libraries,
}: {
  artifact: BuildArtifact;
  contractVersion: string;
  minimalCompilerInput?: string;
  libraries?: LibraryLinks;
}): BuildArtifact {
  const libraryAddresses = normalizeLibraryLinks(libraries, contractVersion);
  const bytecode = linkBytecode(artifact, libraryAddresses);
  const compilerInput = linkCompilerInput(
    artifact,
    minimalCompilerInput || artifact.compilerInput,
    libraryAddresses
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
  libraryAddresses: Record<string, string>
): string {
  let bytecode = artifact.bytecode;

  for (const libraryPath of Object.keys(artifact.linkReferences)) {
    for (const libraryName of Object.keys(
      artifact.linkReferences[libraryPath]
    )) {
      console.log(`libraryPath ${libraryPath} libraryName ${libraryName}`);

      const libraryAddress = libraryAddresses[libraryName];

      if (!libraryAddress) {
        throw new Error(
          `Could not link ${libraryName} for ${artifact.contractName}`
        );
      }

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
  compilerInput: any,
  libraryAddresses: Record<string, string>
): any {
  const result = { ...compilerInput };
  for (const libraryPath of Object.keys(artifact.linkReferences)) {
    for (const libraryName of Object.keys(
      artifact.linkReferences[libraryPath]
    )) {
      const libraryAddress = libraryAddresses[libraryName];
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

function normalizeLibraryLinks(
  libraries: LibraryLinks = {},
  contractVersion: string
): Record<string, string> {
  if (Array.isArray(libraries)) {
    return libraries.reduce<Record<string, string>>((result, artifact) => {
      if (artifact.contractVersion === contractVersion) {
        result[artifact.contractName] = artifact.address;
      }
      return result;
    }, {});
  }

  return libraries;
}
