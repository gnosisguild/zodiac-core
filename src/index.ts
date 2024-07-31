// Core
import encodeDeployProxy from "./encoding/encodeDeployProxy";
import predictProxyAddress from "./encoding/predictProxyAddress";

// Tooling Scripts
import deployFactories from "./tooling/deployFactories";
import deployMastercopy from "./tooling/deployMastercopy";
import deployProxy from "./tooling/deployProxy";

// Main Entrypoints
import extractMastercopy from "./artifact/extractMastercopy";
import deployMastercopies from "./artifact/deployMastercopies";
import verifyMastercopies from "./artifact/verifyMastercopies";

export {
  // core
  encodeDeployProxy,
  predictProxyAddress,

  // tooling
  deployFactories,
  deployMastercopy,
  deployProxy,

  // artifact
  extractMastercopy,
  deployMastercopies,
  verifyMastercopies,
};

import type { EIP1193Provider } from "./types";
export type { EIP1193Provider };
