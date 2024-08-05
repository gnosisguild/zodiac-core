import path from "path";
import { cwd } from "process";

/**
 * Returns the default path to the mastercopy artifacts file.
 *
 * @returns {string} The absolute path to the mastercopy artifacts file.
 */
export function defaultMastercopyArtifactsFile() {
  return path.join(cwd(), "mastercopies.json");
}

/**
 * Returns the default path to the build directory containing contract artifacts.
 *
 * @returns {string} The absolute path to the build directory.
 */
export function defaultBuildDir() {
  return path.join(cwd(), "build", "artifacts", "contracts");
}
