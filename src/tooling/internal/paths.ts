import path from "path";
import { cwd } from "process";

export function defaultMastercopyArtifactsFile() {
  return path.join(cwd(), "mastercopies.json");
}

export function defaultBuildDir() {
  return path.join(cwd(), "build", "artifacts", "contracts");
}
