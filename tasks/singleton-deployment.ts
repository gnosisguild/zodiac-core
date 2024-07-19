import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { deployModuleFactory } from "../sdk/factory/deployModuleFactory";

export const deploy = async (_: unknown, hre: HardhatRuntimeEnvironment) => {
  const Factory = await hre.ethers.getContractFactory("ModuleProxyFactory");
  if (Factory.bytecode !== FactoryInitCode) {
    console.warn(
      "  The compiled Module Proxy Factory is outdated, it does " +
        "not match the bytecode stored at MasterCopyInitData[KnownContracts.FACTORY].initCode"
    );
  }

  const [deployer] = await hre.ethers.getSigners();
  await deployModuleFactory(
    await hre.ethers.provider.getSigner(deployer.address)
  );
};

task(
  "singleton-deployment",
  "Deploy factory through singleton factory"
).setAction(deploy);
