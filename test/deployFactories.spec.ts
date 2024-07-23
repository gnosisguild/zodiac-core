import { loadFixture, reset } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import hre from "hardhat";

import { deployFactories } from "../src";
import { address as moduleFactoryAddress } from "../src/factories/proxyFactory";
import {
  address as singletonFactoryAddress,
  fundingTransaction as singletonFundingTx,
  signedDeployTransaction as singletonDeployRawTx,
} from "../src/factories/singletonFactory";

async function setup() {
  await reset();
}

describe.only("deployFactories", () => {
  it("Deploys both factories if none exists", async () => {
    await loadFixture(setup);

    const [signer] = await hre.ethers.getSigners();
    const { provider } = signer;

    expect(await provider.getCode(singletonFactoryAddress)).to.equal("0x");
    expect(await provider.getCode(moduleFactoryAddress)).to.equal("0x");

    await deployFactories(signer);

    expect(await provider.getCode(singletonFactoryAddress)).to.not.equal("0x");
    expect(await provider.getCode(moduleFactoryAddress)).to.not.equal("0x");
  });

  it("Deploys the ModuleFactory is only the SingletonFactory exists", async () => {
    await loadFixture(setup);
    const [signer] = await hre.ethers.getSigners();
    const { provider } = signer;

    await (await signer.sendTransaction(singletonFundingTx)).wait();
    await provider.send("eth_sendRawTransaction", [singletonDeployRawTx]);

    expect(await provider.getCode(singletonFactoryAddress)).to.not.equal("0x");
    expect(await provider.getCode(moduleFactoryAddress)).to.equal("0x");

    await deployFactories(signer);

    expect(await provider.getCode(singletonFactoryAddress)).to.not.equal("0x");
    expect(await provider.getCode(moduleFactoryAddress)).to.not.equal("0x");
  });

  it("Does nothing is both factories exist", async () => {
    await loadFixture(setup);
    const [signer] = await hre.ethers.getSigners();
    const { provider } = signer;

    expect(await provider.getCode(singletonFactoryAddress)).to.equal("0x");
    expect(await provider.getCode(moduleFactoryAddress)).to.equal("0x");

    await deployFactories(signer);

    expect(await provider.getCode(singletonFactoryAddress)).to.not.equal("0x");
    expect(await provider.getCode(moduleFactoryAddress)).to.not.equal("0x");

    await deployFactories(signer);

    expect(await provider.getCode(singletonFactoryAddress)).to.not.equal("0x");
    expect(await provider.getCode(moduleFactoryAddress)).to.not.equal("0x");
  });
});
