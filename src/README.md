# Module Proxy Factory

The purpose of the Module Proxy Factory is to make the deployment of Zodiac Modules easier. Applying the Minimal Proxy Pattern, this factory reduces the gas cost of deployment and simplifies the tracking of deployed modules. The Minimal Proxy Pattern has been used because the modules do not need to be upgradeable, since a safe can cheaply deploy a module if needed.

It's worth mentioning that it costs roughly 5k additional gas for each transaction when using a proxy.
Thus, after a certain number of transactions (~700) it would likely be cheaper to deploy the module from the constructor rather than the proxy.

There's also a JS API, allowing the developers to easily:

- Deploy the Module Proxy Factory (and the Singleton Factory if it's not already deployed to the current chain). See `src/deployFactories.ts`.
- Deploy Module Mastercopy via the Singleton Factory. See `src/deployMastercopy.ts`. Or build the corresponding transaction payload, see `src/populateDeployMastercopy.ts`
- Deploy Module Minimal Proxy (Clones) via the Module Proxy Factory. See `src/deployProxy.ts`. Or build the corresponding transaction payload, see `src/populateDeployProxy.ts`

Description of the module deployment functionality:

### 1. Deploy and set up a module

This method is used to deploy contracts listed in `./constants.ts`.

- Interface: `populateDeployModule(mastercopy, setupArgs, saltNonce)`
- Arguments:
  - `mastercopy`: Address of the module mastercopy
  - `setupArgs`: An object with two attributes: `value` and `types`
    - In `values` it expects an array of the arguments of the `setUp` function of the module to deploy
    - In `types` it expects an array of the types of every value
  - `saltNonce`: Nonce that will be used to generate the salt to calculate the address of the new proxy contract
- Returns: Transaction that deploys the process, this will allow developers to batch the transaction of deployment + enable module on safe. Example:

```json
{
  "data": "0x",
  "to": "0x",
  "value": "0x" // 0 as BigNumber
}
```

### 2. Calculate new module address

This method is used to calculate the resulting address of a deployed module given the provided parameters. It is useful for building multisend transactions that both deploy a module and then make calls to that module or calls referencing the module's address.

- Interface: `predictProxyAddress(moduleFactory, mastercopyAddress, initData, saltNonce)`
- Arguments:
  - `mastercopy`: Address of the module mastercopy
  - `setupArgs`: An object with two attributes: `value` and `types`
    - In `values` it expects an array of the arguments of the `setUp` function of the module to deploy
    - In `types` it expects an array of the types of every value
  - `saltNonce`: Nonce that will be used to generate the salt to calculate the address of the new proxy contract
- Returns: A string with the expected address
