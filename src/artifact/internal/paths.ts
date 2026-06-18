import path from "path";
import { cwd } from "process";

/**
 * Returns the default path to the mastercopy artifact file.
 *
 * @returns {string} The absolute path to the mastercopy artifact file.
 */
export function defaultMastercopyFile() {
  return path.join(cwd(), "mastercopy.json");
}

/**
 * Returns the default path to the build directory containing contract artifacts.
 *
 * @returns {string} The absolute path to the build directory.
 */
export function defaultBuildDir() {
  return path.join(cwd(), "build", "artifacts", "contracts");
}
