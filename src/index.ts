// Core
import encodeDeployProxy from "./encoding/encodeDeployProxy";
import predictProxyAddress from "./encoding/predictProxyAddress";
import encodeDeploySingleton from "./encoding/encodeDeploySingleton";

// Tooling Scripts
import deployFactories from "./deploy/deployFactories";
import deployMastercopy from "./deploy/deployMastercopy";
import deployProxy from "./deploy/deployProxy";

import predictSingletonAddress from "./encoding/predictSingletonAddress";

import readMastercopyArtifact from "./artifact/readMastercopyArtifact";
import writeMastercopyArtifact from "./artifact/writeMastercopyArtifact";
import deployMastercopiesFromArtifact from "./artifact/deployMastercopies";
import verifyMastercopiesFromArtifact from "./artifact/verifyMastercopies";

export {
  // encoding
  encodeDeploySingleton,
  predictSingletonAddress,
  encodeDeployProxy,
  predictProxyAddress,

  // deploy
  deployFactories,
  deployMastercopy,
  deployProxy,

  // artifact
  readMastercopyArtifact,
  writeMastercopyArtifact,
  deployMastercopiesFromArtifact,
  verifyMastercopiesFromArtifact,
};

import type { EIP1193Provider } from "./types";

export type { EIP1193Provider };
