# Zodiac-Core

[![Build Status](https://github.com/gnosisguild/zodiac/workflows/zodiac/badge.svg?branch=master)](https://github.com/gnosisguild/zodiac/actions?branch=master)
[![Coverage Status](https://coveralls.io/repos/github/gnosis/zodiac/badge.svg?branch=master)](https://coveralls.io/github/gnosisguild/zodiac?branch=master)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](https://github.com/gnosisguild/CODE_OF_CONDUCT)

This package includes the base [Zodiac](https://github.com/gnosisguild/zodiac) contracts and interfaces from which Zodiac components are derived. It also includes a typescript SDK for encoding, deploying, and managing mastercopies and module instances.

## Base Contracts

`Module.sol`

Modules are contracts enabled by an Avatar that implement some decision making logic. They should import Module.sol.

`GuardableModule.sol`

A module with a guard enabled that can check transactions before and after execution. Useful for limiting the scope of addresses and functions that a module can call or ensure a certain state is never changed by a module.

`Modifier.sol`

Modifiers are contracts that sit between Modules and Avatars to modify the Module's behavior. For example, they might enforce a delay on all functions a Module attempts to execute. Modifiers should import Modifier.sol and must expose an interface like IAvatar.sol

`GuardableModifier.sol`

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
import { deployFactories } from "@gnosis-guild/zodiac-core";

await deployFactories({
  provider, // an EIP1193 compliant provider
});
```

#### `deployMastercopy`

Deploys a mastercopy using the ERC2470 factory. If the master copy is already deployed, this script will perform no operation. Returns an object containing the mastercopy address and a boolean indicating whether the master copy was previously deployed.

```ts
import { deployMastercopy } from "@gnosis-guild/zodiac-core";

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
import { deployProxy } from "@gnosis-guild/zodiac-core";

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

Functions in this section assist module authors in collecting, persisting, and retrieving mastercopy artifact data to disk. Components should retain all necessary data to deploy and verify mastercopies on a target network and its block explorer. Every released version should be tracked.

#### `writeMastercopyFromBuild`

Extracts and stores current Mastercopy data from the contract build and adds it to the artifacts file, which defaults to `mastercopies.json`. This function is particularly useful when compiling contracts locally.

- **Inputs:**

  • **contractVersion** - The version of the contract.

  • **contractName** - The name of the contract.

  • **constructorArgs** - The constructor arguments required for deployment.

  • **salt** - A 32-byte value used for mastercopy deployment.

  • **factory** - (Optional) The address of the factory contract used to deploy the mastercopy. Defaults to erc2470FactoryAddress.

  • **bytecode** - (Optional) The bytecode of the contract.

  • **compilerInput** - (Optional) The minimal compiler input.

  • **buildDirPath** - (Optional) The path to the build directory. Defaults to defaultBuildDir().

  • **mastercopyArtifactsFile** - (Optional) The path to the mastercopy artifacts file. Defaults to defaultMastercopyArtifactsFile().

- **Retrieves:**

  • **Compiled Bytecode**

  • **Source Code** - If compilerInput is not provided, it will be retrieved from the build directory.

  ```ts
  import { writeMastercopyFromBuild } from "@gnosis-guild/zodiac-core";

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

#### `writeMastercopyFromExplorer`

Fetches and stores the Mastercopy data from a deployed contract on a blockchain by querying an explorer like Etherscan. This function is ideal for contracts already deployed.

- **Inputs:**

  • **contractVersion** - The version of the contract.

  • **address** - The address of the deployed contract.

  • **bytecode** - The bytecode of the contract.

  • **constructorArgs** - The constructor arguments used for deployment.

  • **salt** - A 32-byte value used for mastercopy deployment.

  • **apiUrlOrChainId** - The API URL or Chain ID of the explorer service.

  • **apiKey** - The API key for accessing the explorer service.

  • **factory** - (Optional) The address of the factory contract used to deploy the mastercopy. Defaults to erc2470FactoryAddress.

  • **mastercopyArtifactsFile** - (Optional) The path to the mastercopy artifacts file. Defaults to defaultMastercopyArtifactsFile().

```ts
import { writeMastercopyFromExplorer } from "@gnosis-guild/zodiac-core";

await writeMastercopyFromExplorer({
  contractVersion: "1.0.0",
  address: "0x1234567890abcdef1234567890abcdef12345678",
  bytecode: "0x608060405234801561001057600080fd5b506040516020806101...",
  constructorArgs: {
    types: ["address", "uint256"],
    values: ["0x<address>", 0],
  },
  salt: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdef",
  apiUrlOrChainId: "1",
  apiKey: "YourEtherscanApiKey",
});
```

#### `readMastercopy`

Retrieves the Mastercopy artifact information from the artifacts file. This function is used to access stored data for a specific contract version or the latest available version if no version is specified.

- **Inputs:**

  • **contractName** - The name of the contract.

  • **contractVersion** - (Optional) The version of the contract. If not provided, the latest version will be used.

  • **mastercopyArtifactsFile** - (Optional) The path to the mastercopy artifacts file. Defaults to defaultMastercopyArtifactsFile().

```ts
import { readMastercopy } from "@gnosis-guild/zodiac-core";

const artifact = readMastercopy({
  contractName: "MyNewMod",
  contractVersion: "1.0.0",
});
```

`deployAllMastercopies`

Deploys each Mastercopy listed in the artifacts file using the provided provider. If a Mastercopy is already deployed, it will be skipped.

- **Inputs:**

  • **provider** - An EIP1193-compliant provider to interact with the blockchain.

  • **mastercopyArtifactsFile** - (Optional) The path to the mastercopy artifacts file. Defaults to defaultMastercopyArtifactsFile().

```ts
import { deployAllMastercopies } from "zodiac-core";

await deployAllMastercopies({
  provider, // an EIP1193 compliant provider
});
```

#### `verifyAllMastercopies`

Verifies each Mastercopy in the artifacts file on an Etherscan-compatible block explorer. This function ensures that the deployed contracts are properly verified and visible on public explorers.

- **Inputs:**

  • **apiUrlOrChainId** - The API URL or Chain ID for the verification service.

  • **apiKey** - The API key used for verification.

  • **mastercopyArtifactsFile** - (Optional) The path to the mastercopy artifacts file. Defaults to `defaultMastercopyArtifactsFile()`.

```ts
import { verifyAllMastercopies } from "zodiac-core";

await verifyAllMastercopies({
  apiUrlOrChainId: "1", // or the explorer's API URL
  apiKey: "YourEtherscanApiKey",
});
```
