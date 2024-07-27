import { loadFixture, reset } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import hre from "hardhat";

import {
  deployFactories,
  deploySingleton,
  predictSingletonAddress,
} from "../src";
import createEIP1193 from "./createEIP1193";

import { TestModule__factory } from "../typechain-types";

async function setup() {
  await reset();
  const [signer] = await hre.ethers.getSigners();
  await deployFactories({
    provider: createEIP1193(hre.network.provider, signer),
  });
}

const avatar = "0x0000000000000000000000000000000000000123";
const target = "0x0000000000000000000000000000000000000456";

describe("deployMastercopy", () => {
  it("Deploys a mastercopy, at the predicted address", async () => {
    await loadFixture(setup);

    const { provider } = hre.ethers;
    const [signer] = await hre.ethers.getSigners();

    const bytecode = TestModule__factory.bytecode;
    const salt =
      "0x0000000000000000000000000000000000000000000000000000000000000001";
    const constructorArgs = {
      types: ["address", "address"],
      values: [avatar, target],
    };

    const address = predictSingletonAddress({
      bytecode,
      salt,
      constructorArgs,
    });

    expect(await provider.getCode(address)).to.equal("0x");
    await deploySingleton({
      bytecode,
      constructorArgs,
      salt,
      provider: createEIP1193(hre.network.provider, signer),
    });
    expect(await provider.getCode(address)).to.not.equal("0x");

    const module = TestModule__factory.connect(address, provider);

    expect(await module.avatar()).to.equal(avatar);
  });
});
