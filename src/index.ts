// Core
import encodeDeployProxy from "./encoding/encodeDeployProxy";
import predictProxyAddress from "./encoding/predictProxyAddress";

// Tooling Scripts
import deployFactories from "./deploy/deployFactories";
import deployMastercopy from "./deploy/deployMastercopy";
import deployProxy from "./deploy/deployProxy";

// Main Entrypoints
import extractMastercopyArtifact from "./artifact/extractMastercopy";
import deployMastercopyArtifacts from "./artifact/deployMastercopies";
import verifyMastercopyArtifacts from "./artifact/verifyMastercopies";

export {
  // core
  encodeDeployProxy,
  predictProxyAddress,

  // deploy
  deployFactories,
  deployMastercopy,
  deployProxy,

  // artifact
  extractMastercopyArtifact,
  deployMastercopyArtifacts,
  verifyMastercopyArtifacts,
};

import type { EIP1193Provider } from "./types";
export type { EIP1193Provider };
