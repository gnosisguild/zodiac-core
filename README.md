# Zodiac-Core

[![Build Status](https://github.com/gnosisguild/zodiac/workflows/zodiac/badge.svg?branch=master)](https://github.com/gnosisguild/zodiac/actions?branch=master)
[![Coverage Status](https://coveralls.io/repos/github/gnosis/zodiac/badge.svg?branch=master)](https://coveralls.io/github/gnosisguild/zodiac?branch=master)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](https://github.com/gnosisguild/CODE_OF_CONDUCT)

This package includes the base [Zodiac](https://github.com/gnosisguild/zodiac) contracts and interfaces from which Zodiac components are derived. It also includes a typescript SDK for encoding, deploying, and managing mastercopies and module instances.

## Base Contracts

Should we include a section for the base contracts?

**Module**
TODO

**GuardableModule**
TODO

**Modifier**
TODO

**GuardableModifier**
TODO

## SDK

The SDK provides functions at three levels of abstraction: encoding, deployment, and artifact management.

### Encoding

The functions in this section produce (but do not execute) payloads that when executed create mastercopies and module instances. These functions are commonly used in apps for deploying new instances of a Zodiac compliant module or modifier, as their payloads can be deployed by any connected account.

#### `encodeDeployProxy`

Generates a payload for deploying a new instance of a module/modifier - the new instance is a minimal proxy, deploy via ZodiacModuleProxyFactory and pointing to a module/modifier mastercopy.

```ts
import { encodeDeployProxy } from "zodiac-core";

const transaction = await encodeDeployProxy({
  mastercopy: "0x<address>",
  setupArgs: { types: ["address", "uint256"], values: ["0x<address>", 0] },
  salt: "0x<bytes32>",
});
```

#### `predictProxyAddress`

Predicts the address of a new module instance, deployed via ZodiacModuleProxyFactory. Useful for deploying and making calls to a module or modifier in one multisend transaction.

```ts
import { predictProxyAddress } from "zodiac-core";

const transaction = await predictProxyAddress({
  mastercopy: "0x<address>",
  setupArgs: { types: ["address", "uint256"], values: ["0x<address>", 0] },
  salt: "0x<bytes32>",
});
```

### Deployment

The functions in this section accept an EIP1193-compliant provider and execute transactions that create mastercopies and module instances. Commonly used in contract infrastructure with a provider like hardhat when developing new modules or modifiers.

#### `deployFactories`

Deploys all factories within a specified network. Typically, these factories are already deployed across networks; however, this function is useful for test setups.

```ts
import { deployFactories } from "zodiac-core";

await deployFactories({
  provider, // an EIP1193 compliant provider
});
```

#### `deployMastercopy`

Deploys a mastercopy using the ERC2470 factory. If the master copy is already deployed, this script will perform no operation. Returns an object containing the mastercopy address and a boolean indicating whether the master copy was previously deployed.

```ts
import { deployMastercopy } from "zodiac-core";

await deployMastercopy({
  bytecode, // the mastercopy bytecode
  constructorArgs: { // mastercopy creation args
    types: ["uint256", "...more constructor types"]
    values: ["0", "...more constructor values"]
  },
  salt, // create2 salt
  provider, // an EIP1193 compliant provider
});
```

#### `deployProxy`

Deploys a module instance as a proxy using the ZodiacModuleProxyFactory. If an instance with the same saltNonce already exists, this function does nothing. Returns an object containing the module instance address and a boolean indicating whether the master copy was previously deployed.

```ts
import { deployProxy } from "zodiac-core";

await deployProxy({
  mastercopy, // the mastercopy address
  setupArgs: { // instance setup args
    types: ["uint256", "...more setup types"]
    values: ["0", "...more setup values"]
  },
  saltNonce, // an integer, used to salt proxy deployment
  provider, // an EIP1193 compliant provider
});
```

### Mastercopy Artifact Management

The functions in this section assist module authors in tracking and persisting mastercopy artifacts for each version produced.

For every version, each component should retain all data needed to deploy and verify it on the target network and its block explorer.

#### `storeMastercopy`

This function collects and compiles all mastercopy artifact data and saves it to the mastercopy artifacts file, which is by default named mastercopies.json.

It receives the following inputs:

- Mastercopy Version
- Mastercopy Contract Name
- Constructor Args
- Creation Salt

It retrieves from the build directory:

- Compiled Bytecode
- Source Code (if a minimal source code input was not provided)

A new entry in the output file will be produced for the current version and contract name.

```ts
import { storeMastercopy as storeMastercopyArtifact } from "zodiac-core";

storeMastercopyArtifact({
  contractVersion: "1.0.0",
  contractName: "MyNewMod",
  constructorArgs: {
    types: ["uint256", "...more constructor types"]
    values: ["0", "...more constructor values"]
  },
  salt, // create2 salt
});
```

#### `deployMastercopies`

Iterates through each entry in the mastercopy artifacts file and deploys the mastercopy using the passed in provider. Entries that are already deployed will result in no operation.

```ts
import { deployMastercopies } from "zodiac-core";

await deployMastercopies({
  provider, // an EIP1193 compliant provider
});
```

#### `verifyMastercopies`

Iterates through each entry in the mastercopy artifacts file and verifies the mastercopy on an etherscan compatible block explorer.

```ts
import { verifyMastercopies } from "zodiac-core";

await verifyMastercopies({
  apiUrl: "chainId or url", // if a chainId is passed in, it will resolve to a block explorer url if one is configured
  apiKey: "<KEY>",
  provider, // an EIP1193 compliant provider
});
```
