// encoding
import encodeDeployProxy from "./encoding/encodeDeployProxy.js";
import predictProxyAddress from "./encoding/predictProxyAddress.js";
import encodeDeploySingleton from "./encoding/encodeDeploySingleton.js";
import predictSingletonAddress from "./encoding/predictSingletonAddress.js";

// tooling
import deployFactories from "./tooling/deployFactories.js";
import deployMastercopy from "./tooling/deployMastercopy.js";
import deployProxy from "./tooling/deployProxy.js";
import verifyMastercopy from "./tooling/verifyMastercopy.js";

// artifact
import readMastercopies from "./artifact/readMastercopies.js";
import writeMastercopyFromBuild from "./artifact/writeMastercopyFromBuild.js";
import writeMastercopyFromExplorer from "./artifact/writeMastercopyFromExplorer.js";

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

import type { EIP1193Provider } from "./types.js";

export type { EIP1193Provider };
