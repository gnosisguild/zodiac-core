// Core
import encodeDeployProxyTransaction from "./encoding/encodeDeployProxyTransaction";
import encodeDeploySingletonTransaction from "./encoding/encodeDeploySingletonTransaction";
import predictProxyAddress from "./encoding/predictProxyAddress";
import predictSingletonAddress from "./encoding/predictSingletonAddress";

// Tooling Scripts
import deployFactories from "./tooling/deployFactories";
import deployMastercopy from "./tooling/deployMastercopy";
import deployProxy from "./tooling/deployProxy";

// Main Entrypoints
import deployMastercopies from "./deployMastercopies";
import extractMastercopy from "./extractMastercopy";
import verifyMastercopies from "./verifyMastercopies";

export {
  // core
  encodeDeployProxyTransaction,
  encodeDeploySingletonTransaction,
  predictProxyAddress,
  predictSingletonAddress,

  // tooling
  deployFactories,
  deployMastercopy,
  deployProxy,

  // entrypoints
  deployMastercopies,
  extractMastercopy,
  verifyMastercopies,
};

import type { EIP1193Provider } from "./types";
export type { EIP1193Provider };
