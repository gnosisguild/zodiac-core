# Zodiac-Core

[![Build Status](https://github.com/gnosisguild/zodiac/workflows/zodiac/badge.svg?branch=master)](https://github.com/gnosisguild/zodiac/actions?branch=master)
[![Coverage Status](https://coveralls.io/repos/github/gnosis/zodiac/badge.svg?branch=master)](https://coveralls.io/github/gnosisguild/zodiac?branch=master)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](https://github.com/gnosisguild/CODE_OF_CONDUCT)

This package includes the base [Zodiac](https://github.com/gnosisguild/zodiac) contracts and interfaces from which Zodiac components are derived. It also includes a browser-safe TypeScript SDK for encoding module deployments and a separate tooling entrypoint for deployment and artifact workflows.

## Base Contracts

[**`Module.sol`**](/contracts/core/Module.sol)

Modules are contracts enabled by an Avatar that implement some decision making logic. They should import Module.sol.

[**`GuardableModule.sol`**](/contracts/core/GuardableModule.sol)

A module with a guard enabled that can check transactions before and after execution. Useful for limiting the scope of addresses and functions that a module can call or ensure a certain state is never changed by a module.

[**`Modifier.sol`**](/contracts/core/Modifier.sol)

Modifiers are contracts that sit between Modules and Avatars to modify the Module's behavior. For example, they might enforce a delay on all functions a Module attempts to execute. Modifiers should import Modifier.sol and must expose an interface like IAvatar.sol

[**`GuardableModifier.sol`**](/contracts/core/GuardableModifier.sol)

A modifier with a guard enabled that can check transactions before and after execution. Useful for limiting the scope of addresses and functions that a modifier can call or ensure a certain state is never changed by a modifier.

## SDK

The SDK provides functions at three levels of abstraction: encoding, deployment, and artifact management.

### Encoding

The functions in this section produce (but do not execute) payloads that when executed create mastercopies and module instances. These functions are commonly used in apps for deploying new instances of a Zodiac compliant module or modifier, as their payloads can be deployed by any connected account.

#### `encodeDeployProxy`

Generates a payload for deploying a new instance of a module/modifier - the new instance is a minimal proxy, deploy via ZodiacModuleProxyFactory and pointing to a module/modifier mastercopy.

```ts
import { encodeDeployProxy } from "@gnosis-guild/zodiac-core";

const transaction = await encodeDeployProxy({
  mastercopy: "0x<address>",
  setupArgs: { types: ["address", "uint256"], values: ["0x<address>", 0] },
  salt: "0x<bytes32>",
});
```

#### `predictProxyAddress`

Predicts the address of a new module instance, deployed via ZodiacModuleProxyFactory. Useful for deploying and making calls to a module or modifier in one multisend transaction.

```ts
import { predictProxyAddress } from "@gnosis-guild/zodiac-core";

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
import { deployFactories } from "@gnosis-guild/zodiac-core/tooling";

await deployFactories({
  provider, // an EIP1193 compliant provider
});
```

#### `deployMastercopy`

Deploys a mastercopy using the ERC2470 factory. If the master copy is already deployed, this script will perform no operation. Returns an object containing the mastercopy address and a boolean indicating whether the master copy was previously deployed.

```ts
import { deployMastercopy } from "@gnosis-guild/zodiac-core/tooling";

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
import { deployProxy } from "@gnosis-guild/zodiac-core/tooling";

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

Functions in this section assist module authors in collecting, persisting, and retrieving one mastercopy artifact from disk. Each package should write its own `mastercopy.json`; version maps and cross-package artifact registries live outside `zodiac-core`.

#### `writeMastercopyFromBuild`

Extracts current Mastercopy data from the contract build and writes it to a single artifact file, which defaults to `mastercopy.json`.

**Inputs**

• **`contractVersion`** - The version of the contract.

• **`contractName`** - The name of the contract.

• **`constructorArgs`** - The constructor arguments required for deployment.

• **`salt`** - A 32-byte value used for mastercopy deployment.

• **`factory`** - (Optional) The address of the factory contract used to deploy the mastercopy. Defaults to erc2470FactoryAddress.

• **`compilerInput`** - (Optional) The minimal compiler input.

• **`libraries`** - (Optional) Library addresses or mastercopy artifacts used to link the build artifact.

• **`buildDirPath`** - (Optional) The path to the build directory. Defaults to defaultBuildDir().

• **`mastercopyFile`** - (Optional) The path to the mastercopy artifact file. Defaults to `mastercopy.json`.

**Retrieves**

• **Compiled Bytecode**

• **Source Code** - If compilerInput is not provided, it will be retrieved from the build directory.

```ts
import { writeMastercopyFromBuild } from "@gnosis-guild/zodiac-core/tooling";

writeMastercopyFromBuild({
  contractVersion: "1.0.0",
  contractName: "MyNewMod",
  constructorArgs: {
    types: ["uint256", "address"],
    values: [0, "0x<address>"],
  },
  salt: "0x<bytes32>",
});
```

#### `readMastercopy`

Reads one Mastercopy artifact from disk.

**Inputs**

• **`mastercopyFile`** - (Optional) The path to the mastercopy artifact file. Defaults to `mastercopy.json`.

```ts
import { readMastercopy } from "@gnosis-guild/zodiac-core/tooling";

const artifact = readMastercopy();
```

The returned artifact can be passed directly into deploy or verify tooling:

```ts
import {
  deployMastercopy,
  readMastercopy,
  verifyMastercopy,
} from "@gnosis-guild/zodiac-core/tooling";

const artifact = readMastercopy();

await deployMastercopy({
  ...artifact,
  provider,
});

await verifyMastercopy({
  chainId: 1,
  apiKey: "YourEtherscanApiKey",
  artifact,
});
```

### Verification

The verification functions allow you to confirm that a deployed contract’s source code and metadata match what is expected on a blockchain explorer (such as Etherscan). These functions ensure that the API URL is reachable, the provided API key is valid, and check if the contract has already been verified. They also support an optional custom API URL for explorers that are not part of the default configuration.

**verifyMastercopy**

Verifies a Mastercopy contract by checking if it’s already verified on the explorer, and if not, submits the contract’s source code and metadata for verification. The function pauses for 500ms between verifications to prevent rate-limiting issues.

```ts
import { verifyMastercopy } from "@gnosis-guild/zodiac-core/tooling";

const result = await verifyMastercopy({
  chainId: 1,
  apiKey: "YourEtherscanApiKey",
  artifact: {
    contractName: "MyContract",
    sourceName: "MyContract.sol",
    compilerVersion: "v0.8.0+commit.c7dfd78e",
    compilerInput: "{}",
    address: "0x1234567890abcdef1234567890abcdef12345678",
    constructorArgs: {
      types: ["uint256"],
      values: [42],
    },
  },
  apiUrl: "https://api.customnet.io/api", // Optional custom API URL
});

console.log(result);
```

_Note: In most cases, you will directly use verifyMastercopy for verifying mastercopies._
