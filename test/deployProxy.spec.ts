import { expect } from "chai";

import { network } from "hardhat";

import createEIP1193 from "./createEIP1193";

import { deployFactories, deployMastercopy, deployProxy } from "../src/tooling";
import { predictProxyAddress } from "../src/index";

const connection = await network.create();
const { ethers, networkHelpers, provider: hardhatProvider } = connection;
const { loadFixture } = networkHelpers;

async function setup() {
  const TestModule = await ethers.getContractFactory("TestModule");
  const bytecode = TestModule.bytecode;
  const salt =
    "0x0000000000000000000000000000000000000000000000000000000000000001";
  const constructorArgs = {
    types: ["address", "address"],
    values: [avatar, target],
  };

  const [signer] = await ethers.getSigners();
  const provider = createEIP1193(hardhatProvider, signer);
  await deployFactories({ provider });
  const { address } = await deployMastercopy({
    bytecode,
    constructorArgs,
    salt,
    provider,
  });

  return { mastercopy: address };
}

const avatar = "0x0000000000000000000000000000000000000123";
const target = "0x0000000000000000000000000000000000000456";

describe("deployProxy", () => {
  after(async () => {
    await connection.close();
  });

  it("Deploys a proxy at the predicted address", async () => {
    const { mastercopy } = await loadFixture(setup);

    const [signer] = await ethers.getSigners();
    const { provider } = ethers;

    const avatar = "0x0000000000000000000000000000000000000789";
    const target = "0x0000000000000000000000000000000000000345";

    const setupArgs = {
      types: ["address", "address"],
      values: [avatar, target],
    };

    const address = predictProxyAddress({
      mastercopy,
      setupArgs,
      saltNonce: 1,
    });

    expect(await provider.getCode(mastercopy)).to.not.equal("0x");
    expect(await provider.getCode(address)).to.equal("0x");

    await deployProxy({
      mastercopy,
      setupArgs,
      saltNonce: 1,
      provider: createEIP1193(hardhatProvider, signer),
    });

    expect(await provider.getCode(address)).to.not.equal("0x");

    const proxy = (await ethers.getContractAt(
      "TestModule",
      address,
      signer
    )) as any;
    expect(await proxy.avatar()).to.equal(avatar);
  });
});
