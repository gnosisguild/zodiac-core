// encoding
import encodeDeployProxy from "./encoding/encodeDeployProxy.js";
import predictProxyAddress from "./encoding/predictProxyAddress.js";
import encodeDeploySingleton from "./encoding/encodeDeploySingleton.js";
import predictSingletonAddress from "./encoding/predictSingletonAddress.js";

export {
  // encoding
  encodeDeploySingleton,
  predictSingletonAddress,
  encodeDeployProxy,
  predictProxyAddress,
};

import type { EIP1193Provider } from "./types.js";

export type { EIP1193Provider };
