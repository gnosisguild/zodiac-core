import { expect } from "chai";
import hre from "hardhat";

import deploySingletonFactory from "./deploySingletonFactory";
import deployModuleFactory from "./deployModuleFactory";
import createEIP1193Adapter from "./eip1193/createHardhatAdapter";

const expectedAddress = "0x000000000000aDdB49795b0f9bA5BC298cDda236";

describe("deployModuleProxyFactory", () => {
  it("should deploy a module proxy factory if one does not exist", async () => {
    const requestFunc = createEIP1193Adapter(hre);
    await deploySingletonFactory(requestFunc);

    expect(await hre.ethers.provider.getCode(expectedAddress)).to.equal("0x");
    await deployModuleFactory(requestFunc);
    expect(await hre.ethers.provider.getCode(expectedAddress)).to.not.equal(
      "0x"
    );
  });
});
