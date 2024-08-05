import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import hre from "hardhat";

import { TestGuard__factory, TestModule__factory } from "../typechain-types";
import { ZeroAddress } from "ethers";

/**
 * Sets up the test environment.
 * Deploys the TestAvatar, TestModule, TestGuard, and TestNonCompliantGuard contracts.
 * Enables the module in the avatar and prepares a transaction object for testing.
 *
 * @returns {Promise<{ owner: any, other: any, module: any, guard: any, guardNonCompliant: any, tx: object }>} The deployed contract instances, test signers, and a sample transaction object.
 */
async function setupTests() {
  const [owner, other, relayer] = await hre.ethers.getSigners();
  const Avatar = await hre.ethers.getContractFactory("TestAvatar");
  const avatar = await Avatar.deploy();
  const Module = await hre.ethers.getContractFactory("TestModule");
  const module = TestModule__factory.connect(
    await (
      await Module.connect(owner).deploy(
        await avatar.getAddress(),
        await avatar.getAddress()
      )
    ).getAddress(),
    owner
  );
  await avatar.enableModule(await module.getAddress());

  const Guard = await hre.ethers.getContractFactory("TestGuard");
  const guard = TestGuard__factory.connect(
    await (await Guard.deploy(await module.getAddress())).getAddress(),
    relayer
  );

  const GuardNonCompliant = await hre.ethers.getContractFactory(
    "TestNonCompliantGuard"
  );
  const guardNonCompliant = TestGuard__factory.connect(
    await (await GuardNonCompliant.deploy()).getAddress(),
    hre.ethers.provider
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
    owner,
    other,
    module,
    guard,
    guardNonCompliant,
    tx,
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
      await expect(module.setGuard(await module.getAddress())).to.be.reverted;
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

describe("BaseGuard", async () => {
  const txHash =
    "0x0000000000000000000000000000000000000000000000000000000000000001";

  /**
   * Tests support for interfaces.
   * Verifies that the guard supports the required interfaces.
   */
  it("supports interface", async () => {
    const { guard } = await loadFixture(setupTests);
    expect(await guard.supportsInterface("0xe6d7a83a")).to.be.true;
    expect(await guard.supportsInterface("0x01ffc9a7")).to.be.true;
  });

  describe("checkTransaction", async () => {
    /**
     * Tests checking a transaction.
     * Verifies that checking the transaction reverts if the test fails.
     */
    it("reverts if test fails", async () => {
      const { guard, tx } = await loadFixture(setupTests);
      await expect(
        guard.checkTransaction(
          tx.to,
          1337,
          tx.data,
          tx.operation,
          tx.avatarTxGas,
          tx.baseGas,
          tx.gasPrice,
          tx.gasToken,
          tx.refundReceiver,
          tx.signatures,
          ZeroAddress
        )
      ).to.be.revertedWith("Cannot send 1337");
    });

    /**
     * Tests checking a transaction.
     * Verifies that the transaction can be checked successfully.
     */
    it("checks transaction", async () => {
      const { guard, tx } = await loadFixture(setupTests);
      await expect(
        guard.checkTransaction(
          tx.to,
          tx.value,
          tx.data,
          tx.operation,
          tx.avatarTxGas,
          tx.baseGas,
          tx.gasPrice,
          tx.gasToken,
          tx.refundReceiver,
          tx.signatures,
          ZeroAddress
        )
      ).to.emit(guard, "PreChecked");
    });
  });

  describe("checkAfterExecution", async () => {
    /**
     * Tests checking the state after execution.
     * Verifies that checking the state after execution reverts if the test fails.
     */
    it("reverts if test fails", async () => {
      const { guard } = await loadFixture(setupTests);
      await expect(guard.checkAfterExecution(txHash, true)).to.be.revertedWith(
        "Module cannot remove its own guard."
      );
    });

    /**
     * Tests checking the state after execution.
     * Verifies that the state can be checked successfully after execution.
     */
    it("checks state after execution", async () => {
      const { module, guard } = await loadFixture(setupTests);
      await expect(module.setGuard(await guard.getAddress()))
        .to.emit(module, "ChangedGuard")
        .withArgs(await guard.getAddress());
      await expect(guard.checkAfterExecution(txHash, true))
        .to.emit(guard, "PostChecked")
        .withArgs(true);
    });
  });
});
