// Core
import encodeDeployProxy from "./encoding/encodeDeployProxy";
import predictProxyAddress from "./encoding/predictProxyAddress";
import { encodeDeploySingleton } from "./encoding/encodeDeploySingleton";

// Tooling Scripts
import deployFactories from "./deploy/deployFactories";
import deployMastercopy from "./deploy/deployMastercopy";
import deployProxy from "./deploy/deployProxy";

import predictSingletonAddress from "./encoding/predictSingletonAddress";

// Main Entrypoints
import storeMastercopyArtifact from "./artifact/storeMastercopy";
import deployMastercopiesFromArtifact from "./artifact/deployMastercopies";
import verifyMastercopiesFromArtifact from "./artifact/verifyMastercopies";

export {
  // core
  encodeDeployProxy,
  predictProxyAddress,
  predictSingletonAddress,
  encodeDeploySingleton,

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
