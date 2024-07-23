import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import hre from "hardhat";

import deployFactories from "./deployFactories";
import { address as moduleFactoryAddress } from "./factories/moduleFactory";
import {
  address as singletonFactoryAddress,
  fundingTransaction as singletonFundingTx,
  signedDeployTransaction as singletonDeployRawTx,
} from "./factories/singletonFactory";

function reset() {}

describe("deployFactories", () => {
  it("Deploys both factories if none exists", async () => {
    await loadFixture(reset as any);
    const provider = hre.ethers.provider;
    expect(await provider.getCode(singletonFactoryAddress)).to.equal("0x");
    expect(await provider.getCode(moduleFactoryAddress)).to.equal("0x");

    await deployFactories(hre);

    expect(await provider.getCode(singletonFactoryAddress)).to.not.equal("0x");
    expect(await provider.getCode(moduleFactoryAddress)).to.not.equal("0x");
  });

  it("Deploys the ModuleFactory is only the SingletonFactory exists", async () => {
    await loadFixture(reset as any);
    const [signer] = await hre.ethers.getSigners();

    await (await signer.sendTransaction(singletonFundingTx)).wait();
    await signer.provider.send("eth_sendRawTransaction", [
      singletonDeployRawTx,
    ]);

    expect(await signer.provider.getCode(singletonFactoryAddress)).to.not.equal(
      "0x"
    );
    expect(await signer.provider.getCode(moduleFactoryAddress)).to.equal("0x");

    await deployFactories(hre);

    expect(await signer.provider.getCode(singletonFactoryAddress)).to.not.equal(
      "0x"
    );
    expect(await signer.provider.getCode(moduleFactoryAddress)).to.not.equal(
      "0x"
    );
  });

  it("Does nothing is both factories exist", async () => {
    await loadFixture(reset as any);
    const provider = hre.ethers.provider;
    expect(await provider.getCode(singletonFactoryAddress)).to.equal("0x");
    expect(await provider.getCode(moduleFactoryAddress)).to.equal("0x");

    await deployFactories(hre);
    await deployFactories(hre);

    expect(await provider.getCode(singletonFactoryAddress)).to.not.equal("0x");
    expect(await provider.getCode(moduleFactoryAddress)).to.not.equal("0x");
  });
});
