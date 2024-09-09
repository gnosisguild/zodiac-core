import assert from "assert";
import path from "path";
import { isAddress } from "ethers";
import { readdirSync, readFileSync, statSync } from "fs";

import { BuildArtifact, MastercopyArtifact } from "../../types";

/**
 * Retrieves the build artifact for a specified contract.
 *
 * @param {string} _contractName - The name of the contract.
 * @param {string} buildDirPath - The path to the directory containing build artifacts.
 * @returns {BuildArtifact} The build artifact containing the contract's bytecode, ABI, and compiler information.
 * @throws {Error} If the artifact or build info is not found.
 */
export default function getBuildArtifact(
  _contractName: string,
  buildDirPath: string
): BuildArtifact {
  const { artifactPath, buildInfoPath } = resolvePaths(
    _contractName,
    buildDirPath
  );

  const { sourceName, contractName, bytecode, abi, linkReferences } =
    JSON.parse(readFileSync(artifactPath, "utf8"));

  const { solcLongVersion, input } = JSON.parse(
    readFileSync(buildInfoPath, "utf8")
  );

  return {
    contractName,
    sourceName,
    compilerVersion: `v${solcLongVersion}`,
    compilerInput: input,
    bytecode,
    abi,
    linkReferences,
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
export function resolveLinksInBytecode(
  contractVersion: string,
  artifact: BuildArtifact,
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

/**
 * Resolves the paths to the artifact and build info files for a specified contract.
 *
 * @param {string} name - The name of the contract.
 * @param {string} artifactsDirPath - The path to the directory containing artifacts.
 * @returns {Object} An object containing the paths to the artifact and build info files.
 * @throws {Error} If the artifact file is not found.
 */
function resolvePaths(name: string, artifactsDirPath: string) {
  const artifactPath = searchFile(`${name}.json`, artifactsDirPath);
  if (!artifactPath) {
    throw new Error("Artifact Not Found");
  }

  const artifactDebugPath = `${artifactPath.split(".json")[0]}.dbg.json`;

  const { buildInfo } = JSON.parse(readFileSync(artifactDebugPath, "utf8"));
  const buildInfoPath = path.join(path.dirname(artifactDebugPath), buildInfo);

  return { artifactPath, buildInfoPath };
}

/**
 * Searches for a file in a directory and its subdirectories.
 *
 * @param {string} fileName - The name of the file to search for.
 * @param {string} dirPath - The path to the directory to search in.
 * @returns {string | null} The path to the found file, or null if not found.
 */
function searchFile(fileName: string, dirPath: string): string | null {
  for (const file of readdirSync(dirPath)) {
    const fullPath = path.join(dirPath, file);

    if (statSync(fullPath).isDirectory()) {
      const found = searchFile(fileName, fullPath);
      if (found) {
        return found;
      }
    }

    if (file.toLowerCase() === fileName.toLowerCase()) {
      return fullPath;
    }
  }

  return null;
}

export function sourcePathFromSourceCode(
  compilerInput: any,
  contractName: string
): string | null {
  for (const [sourceName, sourceCodeEntry] of Object.entries(
    compilerInput.sources
  )) {
    const sourceCode = (sourceCodeEntry as any).content;
    const contractPattern = new RegExp(
      `(contract|library)\\s+${contractName}\\s+`,
      "g"
    );
    if (contractPattern.test(sourceCode)) {
      return sourceName;
    }
  }

  return null;
}
