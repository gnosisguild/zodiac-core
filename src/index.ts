// Core
import encodeDeployProxy from "./encoding/encodeDeployProxy";
import predictProxyAddress from "./encoding/predictProxyAddress";

// Tooling Scripts
import deployFactories from "./deploy/deployFactories";
import deployMastercopy from "./deploy/deployMastercopy";
import deployProxy from "./deploy/deployProxy";

// Main Entrypoints
import storeMastercopyArtifact from "./artifact/storeMastercopy";
import deployMastercopiesFromArtifact from "./artifact/deployMastercopies";
import verifyMastercopiesFromArtifact from "./artifact/verifyMastercopies";

export {
  // core
  encodeDeployProxy,
  predictProxyAddress,

  // deploy
  deployFactories,
  deployMastercopy,
  deployProxy,

  // artifact
  storeMastercopyArtifact,
  deployMastercopiesFromArtifact,
  verifyMastercopiesFromArtifact,
};

import type { EIP1193Provider } from "./types";
export type { EIP1193Provider };
