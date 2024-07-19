import { expect } from "chai";
import hre from "hardhat";

import deploySingletonFactory from "./deploySingletonFactory";
import { address as singletonFactoryAddress } from "./singletonFactory";
import createEIP1193Adapter from "./eip1193/createHardhatAdapter";

describe("deploySingletonFactory", () => {
  it("should deploy a singleton factory if one does not exist", async () => {
    const provider = hre.ethers.provider;
    expect(await provider.getCode(singletonFactoryAddress)).to.equal("0x");

    const requestFunc = createEIP1193Adapter(hre);
    await deploySingletonFactory(requestFunc);

    expect(await provider.getCode(singletonFactoryAddress)).to.not.equal("0x");
  });
});
