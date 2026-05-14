import { expect } from "chai";
import { ZeroAddress } from "ethers";

import { network } from "hardhat";

const connection = await network.create();
const { ethers, networkHelpers } = connection;
const { loadFixture } = networkHelpers;

describe("Guard", () => {
  after(async () => {
    await connection.close();
  });

  /**
   * Sets up the test environment.
   * Deploys the TestAvatar, TestModule, TestGuard, and TestNonCompliantGuard contracts.
   * Enables the module in the avatar and prepares a transaction object for testing.
   *
   * @returns {Promise<{ owner: any, other: any, module: any, guard: any, guardNonCompliant: any, tx: object }>} The deployed contract instances, test signers, and a sample transaction object.
   */
  async function setupTests() {
    const [owner, other, relayer] = await ethers.getSigners();
    const Avatar = await ethers.getContractFactory("TestAvatar");
    const avatar = await Avatar.deploy();
    const Module = await ethers.getContractFactory("TestModule");
    const module = (await ethers.getContractAt(
      "TestModule",
      await (
        await Module.connect(owner).deploy(
          await avatar.getAddress(),
          await avatar.getAddress()
        )
      ).getAddress(),
      owner
    )) as any;
    await avatar.enableModule(await module.getAddress());

    const Guard = await ethers.getContractFactory("TestGuard");
    const guard = (await ethers.getContractAt(
      "TestGuard",
      await (await Guard.deploy(await module.getAddress())).getAddress(),
      relayer
    )) as any;

    const GuardNonCompliant = await ethers.getContractFactory(
      "TestNonCompliantGuard"
    );
    const guardNonCompliant = await GuardNonCompliant.deploy();

    return {
      owner,
      other,
      module,
      guard,
      guardNonCompliant,
    };
  }

  describe("Guardable", async () => {
    describe("setGuard", async () => {
      /**
       * Tests setting the guard.
       * Verifies that setting the guard reverts if the caller is not the owner.
       */
      it("reverts if caller is not the owner", async () => {
        const { other, guard, module } = await loadFixture(setupTests);
        await expect(module.connect(other).setGuard(await guard.getAddress()))
          .to.be.revertedWithCustomError(module, "OwnableUnauthorizedAccount")
          .withArgs(other.address);
      });

      /**
       * Tests setting the guard.
       * Verifies that setting the guard reverts if the guard does not implement ERC165.
       */
      it("reverts if guard does not implement ERC165", async () => {
        const { module } = await loadFixture(setupTests);
        await expect(module.setGuard(await module.getAddress())).to.be.revert(
          ethers
        );
      });

      /**
       * Tests setting the guard.
       * Verifies that setting the guard reverts if the guard implements ERC165 and returns false.
       */
      it("reverts if guard implements ERC165 and returns false", async () => {
        const { module, guardNonCompliant } = await loadFixture(setupTests);
        await expect(module.setGuard(await guardNonCompliant.getAddress()))
          .to.be.revertedWithCustomError(module, "NotIERC165Compliant")
          .withArgs(await guardNonCompliant.getAddress());
      });

      /**
       * Tests setting the guard.
       * Verifies that the guard can be set and emits the ChangedGuard event.
       */
      it("sets module and emits event", async () => {
        const { module, guard } = await loadFixture(setupTests);
        await expect(module.setGuard(await guard.getAddress()))
          .to.emit(module, "ChangedGuard")
          .withArgs(await guard.getAddress());
      });

      /**
       * Tests setting the guard.
       * Verifies that the guard can be set back to zero and emits the ChangedGuard event.
       */
      it("sets guard back to zero", async () => {
        const { module, guard } = await loadFixture(setupTests);
        await expect(module.setGuard(await guard.getAddress()))
          .to.emit(module, "ChangedGuard")
          .withArgs(await guard.getAddress());

        await expect(module.setGuard(ZeroAddress))
          .to.emit(module, "ChangedGuard")
          .withArgs(ZeroAddress);
      });
    });

    describe("getGuard", async () => {
      /**
       * Tests getting the guard address.
       * Verifies that the correct guard address is returned.
       */
      it("returns guard address", async () => {
        const { module } = await loadFixture(setupTests);
        await expect(await module.getGuard()).to.be.equals(ZeroAddress);
      });
    });
  });

  describe("BaseModuleGuard", async () => {
    const moduleTxHash =
      "0x0000000000000000000000000000000000000000000000000000000000000001";

    /**
     * Tests support for interfaces.
     * Verifies that the guard supports the required interfaces.
     */
    it("supports IModuleGuard interface", async () => {
      const { guard } = await loadFixture(setupTests);
      // IModuleGuard interface ID
      const iModuleGuardId = "0x58401ed8";
      expect(await guard.supportsInterface(iModuleGuardId)).to.be.true;
      expect(await guard.supportsInterface("0x01ffc9a7")).to.be.true;
    });

    it("does not support IGuard interface", async () => {
      const { guard } = await loadFixture(setupTests);
      expect(await guard.supportsInterface("0xe6d7a83a")).to.be.false;
    });

    describe("checkModuleTransaction", async () => {
      /**
       * Tests checking a module transaction.
       * Verifies that checking the transaction reverts if the test fails.
       */
      it("reverts if test fails", async () => {
        const { guard, module } = await loadFixture(setupTests);
        await expect(
          guard.checkModuleTransaction(
            await module.getAddress(),
            1337,
            "0x",
            0,
            await module.getAddress()
          )
        ).to.be.revertedWith("Cannot send 1337");
      });

      /**
       * Tests checking a module transaction.
       * Verifies that the transaction can be checked successfully.
       */
      it("checks module transaction", async () => {
        const { guard, module } = await loadFixture(setupTests);
        await expect(
          guard.checkModuleTransaction(
            await module.getAddress(),
            0,
            "0x",
            0,
            await module.getAddress()
          )
        ).to.emit(guard, "PreChecked");
      });
    });

    describe("checkAfterModuleExecution", async () => {
      /**
       * Tests checking the state after module execution.
       * Verifies that checking the state after execution reverts if the test fails.
       */
      it("reverts if test fails", async () => {
        const { guard } = await loadFixture(setupTests);
        await expect(
          guard.checkAfterModuleExecution(moduleTxHash, true)
        ).to.be.revertedWith("Module cannot remove its own guard.");
      });

      /**
       * Tests checking the state after module execution.
       * Verifies that the state can be checked successfully after execution.
       */
      it("checks state after module execution", async () => {
        const { module, guard } = await loadFixture(setupTests);
        await expect(module.setGuard(await guard.getAddress()))
          .to.emit(module, "ChangedGuard")
          .withArgs(await guard.getAddress());
        await expect(guard.checkAfterModuleExecution(moduleTxHash, true))
          .to.emit(guard, "PostChecked")
          .withArgs(true);
      });
    });
  });
});
