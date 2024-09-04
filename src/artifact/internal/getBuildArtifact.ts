import path from "path";
import { readdirSync, readFileSync, statSync } from "fs";

import { BuildArtifact } from "../../types";
import { getCreate2Address, keccak256 } from "ethers";

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
function replaceLibraryReferences(
  bytecode: string,
  linkReferences: Record<string, any>,
  libraryAddresses: Record<string, string>
): string {
  // Iterate through each source file in the linkReferences object
  for (const sourceFile in linkReferences) {
    // Iterate through each library name in the source file
    for (const libName in linkReferences[sourceFile]) {
      const libAddress = libraryAddresses[libName];

      // Ensure that the library address is provided
      if (!libAddress) {
        throw new Error(`Library address for "${libName}" not found.`);
      }

      // Ensure the address is properly formatted (without '0x' and exactly 40 characters long)
      const addressHex = libAddress.toLowerCase().replace("0x", "");
      if (addressHex.length !== 40) {
        throw new Error(
          `Invalid library address for "${libName}": ${libAddress}`
        );
      }

      // Iterate through each reference of the library within the bytecode
      linkReferences[sourceFile][libName].forEach(
        (ref: { start: number; length: number }) => {
          // Extract the placeholder in the bytecode corresponding to the library
          const placeholder = bytecode.slice(
            ref.start * 2,
            (ref.start + ref.length) * 2
          );

          // Replace the placeholder with the correctly padded address (if necessary)
          const paddedAddress = addressHex.padEnd(ref.length * 2, "0");
          bytecode = bytecode.replace(placeholder, paddedAddress);
        }
      );
    }
  }

  // Remove any trailing underscores or erroneous placeholders

  return bytecode.replace("__", "");
}

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
  buildDirPath: string,
  factory: string,
  salt: string
): BuildArtifact {
  const { artifactPath, buildInfoPath } = resolvePaths(
    _contractName,
    buildDirPath
  );

  const {
    sourceName,
    contractName,
    bytecode: artifactBytecode,
    abi,
    linkReferences,
  } = JSON.parse(readFileSync(artifactPath, "utf8"));
  let bytecode = artifactBytecode;
  if (linkReferences && Object.keys(linkReferences).length > 0) {
    let libraryAddresses: Record<string, string> = {};
    Object.keys(linkReferences).forEach((sourceFile) => {
      Object.keys(linkReferences[sourceFile]).forEach((libName) => {
        console.log(`Processing library: ${libName}`);
        const { artifactPath } = resolvePaths(libName, buildDirPath);
        const { bytecode } = JSON.parse(readFileSync(artifactPath, "utf8"));
        const address = getCreate2Address(factory, salt, keccak256(bytecode));
        libraryAddresses = { ...libraryAddresses, [libName]: address };
      });
    });

    bytecode = replaceLibraryReferences(
      artifactBytecode,
      linkReferences,
      libraryAddresses
    );
  }

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
