import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import hre from "hardhat";

import { TestModule__factory } from "../typechain-types";

import deployFactories from "./deployFactories";
import deployMastercopy from "./deployMastercopy";
import { predictMastercopyAddress } from "./populateDeployMastercopy";

async function setup() {
  await deployFactories(hre);
}

const avatar = "0x0000000000000000000000000000000000000123";
const target = "0x0000000000000000000000000000000000000456";

describe("deployMastercopy", () => {
  it("Deploys a mastercopy, at the predicted address", async () => {
    await loadFixture(setup);

    const provider = hre.ethers.provider;

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

    expect(await provider.getCode(address)).to.equal("0x");
    await deployMastercopy({ bytecode, constructorArgs, salt }, hre);
    expect(await provider.getCode(address)).to.not.equal("0x");

    const module = TestModule__factory.connect(address, provider);

    expect(await module.avatar()).to.equal(avatar);
  });
});
