// encoding
import encodeDeployProxy from "./encoding/encodeDeployProxy.ts";
import predictProxyAddress from "./encoding/predictProxyAddress.ts";
import encodeDeploySingleton from "./encoding/encodeDeploySingleton.ts";
import predictSingletonAddress from "./encoding/predictSingletonAddress.ts";

// tooling
import deployFactories from "./tooling/deployFactories.ts";
import deployMastercopy from "./tooling/deployMastercopy.ts";
import deployProxy from "./tooling/deployProxy.ts";
import verifyMastercopy from "./tooling/verifyMastercopy.ts";

// artifact
import readMastercopies from "./artifact/readMastercopies.ts";
import writeMastercopyFromBuild from "./artifact/writeMastercopyFromBuild.ts";
import writeMastercopyFromExplorer from "./artifact/writeMastercopyFromExplorer.ts";

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

import type { EIP1193Provider } from "./types.ts";

export type { EIP1193Provider };
