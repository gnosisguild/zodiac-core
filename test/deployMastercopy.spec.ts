import { expect } from "chai";

import { network } from "hardhat";

import predictSingletonAddress from "../src/encoding/predictSingletonAddress";

import { deployFactories, deployMastercopy } from "../src/tooling";
import createEIP1193 from "./createEIP1193";

const connection = await network.create();
const { ethers, networkHelpers, provider: hardhatProvider } = connection;
const { loadFixture } = networkHelpers;

async function setup() {
  const [signer] = await ethers.getSigners();
  await deployFactories({
    provider: createEIP1193(hardhatProvider, signer),
  });
}

const avatar = "0x0000000000000000000000000000000000000123";
const target = "0x0000000000000000000000000000000000000456";

describe("deployMastercopy", () => {
  after(async () => {
    await connection.close();
  });

  it("Deploys a mastercopy, at the predicted address", async () => {
    await loadFixture(setup);

    const { provider } = ethers;
    const [signer] = await ethers.getSigners();

    const TestModule = await ethers.getContractFactory("TestModule");
    const bytecode = TestModule.bytecode;
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
    await deployMastercopy({
      bytecode,
      constructorArgs,
      salt,
      provider: createEIP1193(hardhatProvider, signer),
    });
    expect(await provider.getCode(address)).to.not.equal("0x");

    const module = (await ethers.getContractAt(
      "TestModule",
      address,
      signer
    )) as any;

    expect(await module.avatar()).to.equal(avatar);
  });
});
