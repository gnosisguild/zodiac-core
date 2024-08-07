import { loadFixture, reset } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import hre from "hardhat";

import { address as erc2470FactoryAddress } from "../src/factory/erc2470Factory";
import { address as moduleFactoryAddress } from "../src/factory/proxyFactory";
import { address as nickFactoryAddress } from "../src/factory/nickFactory";

import { deployFactories } from "../src";

import createEIP1193 from "./createEIP1193";

/**
 * Resets the test environment.
 */
async function setup() {
  await reset();
}

describe("deployFactories", () => {
  /**
   * Tests the deployment of all factories on an empty network.
   * Verifies that the factories are deployed successfully and their code is not empty.
   */
  it("Deploys all factories on an empty network", async () => {
    await loadFixture(setup);

    const [signer] = await hre.ethers.getSigners();
    const { provider } = signer;

    expect(await provider.getCode(nickFactoryAddress)).to.equal("0x");
    expect(await provider.getCode(erc2470FactoryAddress)).to.equal("0x");
    expect(await provider.getCode(moduleFactoryAddress)).to.equal("0x");

    await deployFactories({
      provider: createEIP1193(hre.network.provider, signer),
    });

    expect(await provider.getCode(nickFactoryAddress)).to.not.equal("0x");
    expect(await provider.getCode(erc2470FactoryAddress)).to.not.equal("0x");
    expect(await provider.getCode(moduleFactoryAddress)).to.not.equal("0x");
  });

  /**
   * Tests the deployment of factories when they already exist.
   * Verifies that the deployment does nothing if the factories are already deployed.
   */
  it("Does nothing if all factories exist", async () => {
    await loadFixture(setup);
    const [signer] = await hre.ethers.getSigners();
    const { provider } = signer;

    expect(await provider.getCode(nickFactoryAddress)).to.equal("0x");
    expect(await provider.getCode(erc2470FactoryAddress)).to.equal("0x");
    expect(await provider.getCode(moduleFactoryAddress)).to.equal("0x");

    await deployFactories({
      provider: createEIP1193(hre.network.provider, signer),
    });

    expect(await provider.getCode(nickFactoryAddress)).to.not.equal("0x");
    expect(await provider.getCode(erc2470FactoryAddress)).to.not.equal("0x");
    expect(await provider.getCode(moduleFactoryAddress)).to.not.equal("0x");

    await deployFactories({
      provider: createEIP1193(hre.network.provider, signer),
    });

    expect(await provider.getCode(nickFactoryAddress)).to.not.equal("0x");
    expect(await provider.getCode(erc2470FactoryAddress)).to.not.equal("0x");
    expect(await provider.getCode(moduleFactoryAddress)).to.not.equal("0x");
  });
});
