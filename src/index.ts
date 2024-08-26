// encoding
import encodeDeployProxy from "./encoding/encodeDeployProxy";
import predictProxyAddress from "./encoding/predictProxyAddress";
import encodeDeploySingleton from "./encoding/encodeDeploySingleton";
import predictSingletonAddress from "./encoding/predictSingletonAddress";

// tooling
import deployFactories from "./tooling/deployFactories";
import deployMastercopy from "./tooling/deployMastercopy";
import deployProxy from "./tooling/deployProxy";
import verifyMastercopy from "./tooling/verifyMastercopy";

// artifact
import readMastercopies from "./artifact/readMastercopies";
import writeMastercopyFromBuild from "./artifact/writeMastercopyFromBuild";
import writeMastercopyFromExplorer from "./artifact/writeMastercopyFromExplorer";

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
  verifyMastercopy,

  // mastercopy artifact helpers
  readMastercopies,
  writeMastercopyFromBuild,
  writeMastercopyFromExplorer,
};

import type { EIP1193Provider } from "./types";

export type { EIP1193Provider };
