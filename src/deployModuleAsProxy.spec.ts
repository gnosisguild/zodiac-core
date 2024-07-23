import { expect } from "chai";
import hre from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

import { predictMastercopyAddress } from "./populateDeployMastercopy";
import { predictModuleProxyAddress } from "./populateDeployModuleAsProxy";
import deployFactories from "./deployFactories";
import deployMastercopy from "./deployMastercopy";
import deployModuleAsProxy from "./deployModuleAsProxy";

import { TestModule__factory } from "../typechain-types";

async function setup() {
  const bytecode = TestModule__factory.bytecode;
  const salt =
    "0x0000000000000000000000000000000000000000000000000000000000000001";
  const constructorArgs = {
    types: ["address", "address"],
    values: [avatar, target],
  };

  const address = predictMastercopyAddress({
    bytecode,
    salt,
    constructorArgs,
  });

  await deployFactories(hre);
  await deployMastercopy({ bytecode, constructorArgs, salt }, hre);

  return { mastercopy: address };
}

const avatar = "0x0000000000000000000000000000000000000123";
const target = "0x0000000000000000000000000000000000000456";

describe("deployModuleAsProxy", () => {
  it("Deploys a proxy at the predicted address", async () => {
    const provider = hre.ethers.provider;
    const { mastercopy } = await loadFixture(setup);

    const avatar = "0x0000000000000000000000000000000000000789";
    const target = "0x0000000000000000000000000000000000000345";

    const setupArgs = {
      types: ["address", "address"],
      values: [avatar, target],
    };

    const address = predictModuleProxyAddress({
      mastercopy,
      setupArgs,
      saltNonce: 1,
    });

    expect(await provider.getCode(mastercopy)).to.not.equal("0x");
    expect(await provider.getCode(address)).to.equal("0x");

    await deployModuleAsProxy({ mastercopy, setupArgs, saltNonce: 1 }, hre);

    expect(await provider.getCode(address)).to.not.equal("0x");

    const proxy = TestModule__factory.connect(address, provider);
    expect(await proxy.avatar()).to.equal(avatar);
  });
});
