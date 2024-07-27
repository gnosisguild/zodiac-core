import deployFactories from "./tooling/deployFactories";
import deployMastercopies from "./tooling/deployMastercopies";
import deployProxy from "./tooling/deployProxy";
import deploySingleton from "./tooling/deploySingleton";
import extractMastercopyArtifact from "./tooling/extractMastercopyArtifact";
import verifyMastercopies from "./tooling/verifyMastercopies";

import encodeDeployProxyTransaction from "./encoding/encodeDeployProxyTransaction";
import encodeDeploySingletonTransaction from "./encoding/encodeDeploySingletonTransaction";
import predictProxyAddress from "./encoding/predictProxyAddress";
import predictSingletonAddress from "./encoding/predictSingletonAddress";

export {
  // core
  encodeDeployProxyTransaction,
  encodeDeploySingletonTransaction,
  predictProxyAddress,
  predictSingletonAddress,
  // tooling
  deployFactories,
  deployMastercopies,
  deployProxy,
  deploySingleton,
  extractMastercopyArtifact,
  verifyMastercopies,
};

import type { EIP1193Provider } from "./types";
export type { EIP1193Provider };
