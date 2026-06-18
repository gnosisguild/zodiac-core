import { existsSync, readFileSync } from "fs";

import { defaultMastercopyFile } from "./internal/paths.js";
import { MastercopyArtifact } from "./types.js";

/**
 * Reads one Mastercopy artifact from disk.
 *
 * @param {Object} params - The function parameters.
 * @param {string} [params.mastercopyFile=defaultMastercopyFile()] - The path to the mastercopy artifact file. Optional.
 * @returns {MastercopyArtifact} The Mastercopy artifact stored in the file.
 */
export default function readMastercopy({
  mastercopyFile = defaultMastercopyFile(),
}: {
  mastercopyFile?: string;
} = {}): MastercopyArtifact {
  if (!existsSync(mastercopyFile)) {
    throw new Error(`Mastercopy artifact file not found at ${mastercopyFile}`);
  }

  return JSON.parse(readFileSync(mastercopyFile, "utf8")) as MastercopyArtifact;
}
