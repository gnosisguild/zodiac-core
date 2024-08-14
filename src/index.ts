// Core
import encodeDeployProxy from "./encoding/encodeDeployProxy";
import predictProxyAddress from "./encoding/predictProxyAddress";
import encodeDeploySingleton from "./encoding/encodeDeploySingleton";

// Tooling Scripts
import deployFactories from "./deploy/deployFactories";
import deployMastercopy from "./deploy/deployMastercopy";
import deployProxy from "./deploy/deployProxy";

import predictSingletonAddress from "./encoding/predictSingletonAddress";

import writeMastercopyFromBuild from "./artifact/writeMastercopyFromBuild";
import writeMastercopyFromExplorer from "./artifact/writeMastercopyFromExplorer";
import readMastercopy from "./artifact/readMastercopy";
import deployAllMastercopies from "./artifact/deployAllMastercopies";
import verifyAllMastercopies from "./artifact/verifyAllMastercopies";

export {
  // encoding
  encodeDeploySingleton,
  predictSingletonAddress,
  encodeDeployProxy,
  predictProxyAddress,

  // low-level tasks
  deployFactories,
  deployMastercopy,
  deployProxy,

  // mastercopy artifact helpers
  writeMastercopyFromBuild,
  writeMastercopyFromExplorer,
  readMastercopy,
  deployAllMastercopies,
  verifyAllMastercopies,
};

import type { EIP1193Provider } from "./types";

export type { EIP1193Provider };
