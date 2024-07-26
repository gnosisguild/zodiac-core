import {
  deployFactories,
  deployMastercopy,
  deployProxy,
  mastercopiesExtract,
  mastercopiesDeploy,
  mastercopiesVerify,
} from "./tooling";

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
  deployMastercopy,
  deployProxy,
  mastercopiesExtract,
  mastercopiesDeploy,
  mastercopiesVerify,
};

import type { EIP1193Provider } from "./types";
export type { EIP1193Provider };
