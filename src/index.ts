import {
  deployFactories,
  deployMastercopy,
  deployProxy,
  extractMastercopy,
  verifyMastercopy,
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
  extractMastercopy,
  verifyMastercopy,
};

import type { EIP1193Provider, MastercopyArtifact } from "./types";
export type { EIP1193Provider, MastercopyArtifact };
