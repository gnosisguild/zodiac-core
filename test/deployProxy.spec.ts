import { loadFixture, reset } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import hre from "hardhat";

import {
  deployFactories,
  deployMastercopy,
  deployProxy,
  predictMastercopyAddress,
  predictProxyAddress,
} from "../src";
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

  await reset();

  const [signer] = await hre.ethers.getSigners();
  await deployFactories(signer);
  await deployMastercopy({ bytecode, constructorArgs, salt }, signer);

  return { mastercopy: address };
}

const avatar = "0x0000000000000000000000000000000000000123";
const target = "0x0000000000000000000000000000000000000456";

describe("deployProxy", () => {
  it("Deploys a proxy at the predicted address", async () => {
    const { mastercopy } = await loadFixture(setup);
    const [signer] = await hre.ethers.getSigners();
    const provider = signer.provider!;

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

    await deployProxy({ mastercopy, setupArgs, saltNonce: 1 }, signer);

    expect(await provider.getCode(address)).to.not.equal("0x");

    const proxy = TestModule__factory.connect(address, provider);
    expect(await proxy.avatar()).to.equal(avatar);
  });
});
