import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import deployFactories from "../src/deployFactories";

export const deploy = async (_: unknown, hre: HardhatRuntimeEnvironment) => {
  await deployFactories(hre);
};

task(
  "singleton-deployment",
  "Deploy factory through singleton factory"
).setAction(deploy);
