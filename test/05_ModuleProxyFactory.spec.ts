import { AddressOne } from "@gnosis.pm/safe-contracts";
import { expect } from "chai";
import { AbiCoder, Contract, getAddress, ZeroAddress } from "ethers";
import { ethers } from "hardhat";

import { predictProxyAddress } from "../src";

const AddressZero = ZeroAddress;

describe("ModuleProxyFactory", async () => {
  let moduleFactory: Contract;
  let moduleMasterCopy: Contract;
  let avatarAddress: string;
  let initData: string;
  let setupArgs: { types: any[]; values: any[] };

  const saltNonce = "0x7255";

  beforeEach(async () => {
    const Avatar = await ethers.getContractFactory("TestAvatar");
    const avatar = await Avatar.deploy();
    const ModuleProxyFactory =
      await ethers.getContractFactory("ModuleProxyFactory");
    moduleFactory = await ModuleProxyFactory.deploy();

    const MasterCopyModule = await ethers.getContractFactory("TestModule");
    moduleMasterCopy = await MasterCopyModule.deploy(
      await avatar.getAddress(),
      await avatar.getAddress()
    );
    const encodedInitParams = AbiCoder.defaultAbiCoder().encode(
      ["address", "address"],
      [await avatar.getAddress(), await avatar.getAddress()]
    );
    initData = moduleMasterCopy.interface.encodeFunctionData("setUp", [
      encodedInitParams,
    ]);
    setupArgs = {
      types: ["address", "address"],
      values: [await avatar.getAddress(), await avatar.getAddress()],
    };
    avatarAddress = await avatar.getAddress();
  });

  describe("createProxy", () => {
    /**
     * Tests the deployment of a proxy module.
     * Verifies that the deployed address matches the predicted address.
     */
    it("should deploy the expected address", async () => {
      const mastercopy = getAddress(await moduleMasterCopy.getAddress());

      const expectedAddress = await predictProxyAddress({
        factory: await moduleFactory.getAddress(),
        mastercopy,
        setupArgs,
        saltNonce,
      });

      const deploymentTx = await moduleFactory.deployModule(
        await moduleMasterCopy.getAddress(),
        initData,
        saltNonce
      );

      const transaction = await deploymentTx.wait();
      const [actualAddress] = transaction.logs[2].args;

      expect(expectedAddress).to.be.equal(actualAddress);
    });

    /**
     * Tests the deployment of a proxy module with a zero address.
     * Verifies that the deployment fails and reverts with a ZeroAddress error.
     */
    it("should fail to deploy module because address is zero", async () => {
      await expect(moduleFactory.deployModule(AddressZero, initData, saltNonce))
        .to.be.revertedWithCustomError(moduleFactory, "ZeroAddress")
        .withArgs(AddressZero);
    });

    /**
     * Tests the deployment of a proxy module with a target address that has no code deployed.
     * Verifies that the deployment fails and reverts with a TargetHasNoCode error.
     */
    it("should fail to deploy module because target has no code deployed", async () => {
      await expect(moduleFactory.deployModule(AddressOne, initData, saltNonce))
        .to.be.revertedWithCustomError(moduleFactory, "TargetHasNoCode")
        .withArgs(AddressOne);
    });

    /**
     * Tests the deployment of a proxy module to an address that is already taken.
     * Verifies that the deployment fails and reverts with a TakenAddress error.
     */
    it("should fail to deploy because address is already taken", async () => {
      await moduleFactory.deployModule(
        await moduleMasterCopy.getAddress(),
        initData,
        saltNonce
      );

      await expect(
        moduleFactory.deployModule(
          await moduleMasterCopy.getAddress(),
          initData,
          saltNonce
        )
      )
        .to.be.revertedWithCustomError(moduleFactory, "TakenAddress")
        .withArgs(AddressZero);
    });
  });

  describe("deployModule", () => {
    /**
     * Tests the deployment of a module.
     * Verifies that the module can be deployed successfully and the avatar address is correct.
     */
    it("should deploy module", async () => {
      const deploymentTx = await moduleFactory.deployModule(
        await moduleMasterCopy.getAddress(),
        initData,
        saltNonce
      );
      const transaction = await deploymentTx.wait();
      const [moduleAddress] = transaction.logs[2].args;

      const newModule = await ethers.getContractAt("TestModule", moduleAddress);

      const moduleAvatar = await newModule.avatar();
      expect(moduleAvatar).to.be.equal(avatarAddress);
    });

    /**
     * Tests the deployment of a module.
     * Verifies that the ModuleProxyCreation event is emitted on module deployment.
     */
    it("should emit event on module deployment", async () => {
      const moduleAddress = await predictProxyAddress({
        factory: await moduleFactory.getAddress(),
        mastercopy: await moduleMasterCopy.getAddress(),
        setupArgs,
        saltNonce,
      });
      await expect(
        moduleFactory.deployModule(
          await moduleMasterCopy.getAddress(),
          initData,
          saltNonce
        )
      )
        .to.emit(moduleFactory, "ModuleProxyCreation")
        .withArgs(moduleAddress, await moduleMasterCopy.getAddress());
    });

    /**
     * Tests the deployment of a module with invalid parameters.
     * Verifies that the deployment fails and reverts with a FailedInitialization error.
     */
    it("should fail to deploy because parameters are not valid", async () => {
      await expect(
        moduleFactory.deployModule(
          await moduleMasterCopy.getAddress(),
          "0xaabc",
          saltNonce
        )
      ).to.be.revertedWithCustomError(moduleFactory, "FailedInitialization");
    });
  });
});
