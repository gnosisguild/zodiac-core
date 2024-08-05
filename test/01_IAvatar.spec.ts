import { ZeroAddress } from "ethers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { TestAvatar__factory } from "../typechain-types";

describe("IAvatar", async () => {
  /**
   * Sets up the test environment.
   * Deploys the TestAvatar contract and prepares a transaction object for testing.
   *
   * @returns {Promise<{ iAvatar: any, tx: object }>} The deployed contract instance and a sample transaction object.
   */
  async function setupTests() {
    const [signer] = await hre.ethers.getSigners();
    const Avatar = await hre.ethers.getContractFactory("TestAvatar");
    const avatar = await Avatar.connect(signer).deploy();
    const iAvatar = TestAvatar__factory.connect(
      await avatar.getAddress(),
      signer
    );
    const tx = {
      to: await avatar.getAddress(),
      value: 0,
      data: "0x",
      operation: 0,
      avatarTxGas: 0,
      baseGas: 0,
      gasPrice: 0,
      gasToken: ZeroAddress,
      refundReceiver: ZeroAddress,
      signatures: "0x",
    };
    return {
      iAvatar,
      tx,
    };
  }

  describe("enableModule", async () => {
    /**
     * Tests enabling a module.
     * Checks that the module is initially disabled, enables it, and verifies it is enabled.
     */
    it("allow to enable a module", async () => {
      const [user1] = await hre.ethers.getSigners();
      const { iAvatar } = await loadFixture(setupTests);
      // Check that the module is initially disabled
      await expect(await iAvatar.isModuleEnabled(user1.address)).to.be.equals(
        false
      );
      // Enable the module
      const transaction = await iAvatar.enableModule(user1.address);
      await transaction.wait();
      // Check that the module is now enabled
      await expect(await iAvatar.isModuleEnabled(user1.address)).to.be.equals(
        true
      );
    });
  });

  describe("disableModule", async () => {
    /**
     * Tests disabling a module.
     * Enables a module, then disables it, and verifies it is disabled.
     */
    it("allow to disable a module", async () => {
      const { iAvatar } = await loadFixture(setupTests);
      const [user1] = await hre.ethers.getSigners();

      // Enable the module
      await expect(await iAvatar.isModuleEnabled(user1.address)).to.be.equals(
        false
      );
      let transaction = await iAvatar.enableModule(user1.address);
      await transaction.wait();
      await expect(await iAvatar.isModuleEnabled(user1.address)).to.be.equals(
        true
      );
      // Disable the module
      transaction = await iAvatar.disableModule(ZeroAddress, user1.address);
      await transaction.wait();
      await expect(await iAvatar.isModuleEnabled(user1.address)).to.be.equals(
        false
      );
    });
  });

  describe("execTransactionFromModule", async () => {
    /**
     * Tests executing a transaction from a module.
     * Verifies that execution is reverted if the module is not enabled.
     */
    it("revert if module is not enabled", async () => {
      const { iAvatar, tx } = await setupTests();
      await expect(
        iAvatar.execTransactionFromModule(
          tx.to,
          tx.value,
          tx.data,
          tx.operation
        )
      ).to.be.revertedWith("Not authorized");
    });

    /**
     * Tests executing a transaction from a module.
     * Enables the module and verifies that transaction execution is allowed.
     */
    it("allow to execute module transaction", async () => {
      const { iAvatar, tx } = await setupTests();
      const [user1] = await hre.ethers.getSigners();
      // Enable the module
      await iAvatar.enableModule(user1.address);
      // Execute the transaction
      await expect(
        iAvatar.execTransactionFromModule(
          tx.to,
          tx.value,
          tx.data,
          tx.operation
        )
      );
    });
  });

  describe("execTransactionFromModuleReturnData", async () => {
    /**
     * Tests executing a transaction from a module and returning data.
     * Verifies that execution is reverted if the module is not enabled.
     */
    it("revert if module is not enabled", async () => {
      const { iAvatar, tx } = await setupTests();
      await expect(
        iAvatar.execTransactionFromModuleReturnData(
          tx.to,
          tx.value,
          tx.data,
          tx.operation
        )
      ).to.be.revertedWith("Not authorized");
    });

    /**
     * Tests executing a transaction from a module and returning data.
     * Enables the module and verifies that transaction execution and data return are allowed.
     */
    it("allow to execute module transaction and return data", async () => {
      const { iAvatar, tx } = await setupTests();
      const [user1] = await hre.ethers.getSigners();
      // Enable the module
      await iAvatar.enableModule(user1.address);
      // Execute the transaction and return data
      await expect(
        iAvatar.execTransactionFromModuleReturnData(
          tx.to,
          tx.value,
          tx.data,
          tx.operation
        )
      );
    });
  });

  describe("isModuleEnabled", async () => {
    /**
     * Tests if a module is enabled.
     * Verifies that it returns false if the module has not been enabled.
     */
    it("returns false if module has not been enabled", async () => {
      const { iAvatar } = await loadFixture(setupTests);
      const [user1] = await hre.ethers.getSigners();
      await expect(await iAvatar.isModuleEnabled(user1.address)).to.be.equals(
        false
      );
    });

    /**
     * Tests if a module is enabled.
     * Enables a module and verifies that it returns true.
     */
    it("returns true if module has been enabled", async () => {
      const { iAvatar } = await loadFixture(setupTests);
      const [user1] = await hre.ethers.getSigners();
      await expect(await iAvatar.isModuleEnabled(user1.address)).to.be.equals(
        false
      );
      const transaction = await iAvatar.enableModule(user1.address);
      await transaction.wait();
      await expect(await iAvatar.isModuleEnabled(user1.address)).to.be.equals(
        true
      );
    });
  });

  describe("getModulesPaginated", async () => {
    /**
     * Tests retrieving enabled modules in a paginated manner.
     * Enables a module and verifies that it is returned in the paginated result.
     */
    it("returns array of enabled modules", async () => {
      const { iAvatar } = await loadFixture(setupTests);
      const [user1] = await hre.ethers.getSigners();
      await iAvatar.enableModule(user1.address);
      const [array, next] = await iAvatar.getModulesPaginated(user1.address, 1);
      await expect(array.toString()).to.be.equals([user1.address].toString());
      await expect(next).to.be.equals(user1.address);
    });
  });
});
