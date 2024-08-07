import path from "path";
import { readdirSync, readFileSync, statSync } from "fs";

import { BuildArtifact } from "../../types";

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

  const { sourceName, contractName, bytecode, abi } = JSON.parse(
    readFileSync(artifactPath, "utf8")
  );

  const { solcLongVersion, input } = JSON.parse(
    readFileSync(buildInfoPath, "utf8")
  );

  return {
    contractName,
    sourceName,
    compilerVersion: `v${solcLongVersion}`,
    compilerInput: input,
    abi,
    bytecode,
  };
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
