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
import createEIP1193 from "./createEIP1193";

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
  const provider = createEIP1193(hre.network.provider, signer);
  await deployFactories(provider);
  await deployMastercopy({ bytecode, constructorArgs, salt }, provider);

  return { mastercopy: address };
}

const avatar = "0x0000000000000000000000000000000000000123";
const target = "0x0000000000000000000000000000000000000456";

describe("deployProxy", () => {
  it("Deploys a proxy at the predicted address", async () => {
    const { mastercopy } = await loadFixture(setup);

    const [signer] = await hre.ethers.getSigners();
    const { provider } = await hre.ethers;

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

    await deployProxy(
      { mastercopy, setupArgs, saltNonce: 1 },
      createEIP1193(hre.network.provider, signer)
    );

    expect(await provider.getCode(address)).to.not.equal("0x");

    const proxy = TestModule__factory.connect(address, provider);
    expect(await proxy.avatar()).to.equal(avatar);
  });
});
