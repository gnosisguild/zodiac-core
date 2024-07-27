import deployFactories from "./tooling/deployFactories";
import deployMastercopies from "./tooling/deployMastercopies";
import deployProxy from "./tooling/deployProxy";
import deploySingleton from "./tooling/deploySingleton";
import extractMastercopyArtifact from "./tooling/extractMastercopyArtifact";
import verifyMastercopies from "./tooling/verifyMastercopies";

import populateDeployMastercopy, {
  predictMastercopyAddress,
} from "./populateDeployMastercopy";
import populateDeployProxy, {
  predictProxyAddress,
} from "./populateDeployProxy";

export {
  // core
  populateDeployMastercopy,
  populateDeployProxy,
  predictMastercopyAddress,
  predictProxyAddress,
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
