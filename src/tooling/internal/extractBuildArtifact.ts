import path from "path";
import { readdirSync, readFileSync, statSync } from "fs";

import { BuildArtifact } from "../../types";

export default function extractBuildArtifact(
  contractName: string,
  buildDirPath: string
): BuildArtifact {
  const { artifactPath, buildInfoPath } = resolvePaths(
    contractName,
    buildDirPath
  );

  const { sourceName, bytecode } = JSON.parse(
    readFileSync(artifactPath, "utf8")
  );

  const { solcLongVersion, input } = JSON.parse(
    readFileSync(buildInfoPath, "utf8")
  );

  return {
    // // this is the fully qualified name, in the format expected by etherscan
    // contractName: `${sourceName}:${contractName}`,
    contractName,
    sourceName,
    bytecode,
    compilerInput: input,
    compilerVersion: `v${solcLongVersion}`,
  };
}

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
