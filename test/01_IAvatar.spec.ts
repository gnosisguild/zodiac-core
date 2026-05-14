import { ZeroAddress } from "ethers";
import { expect } from "chai";

import { network } from "hardhat";

const connection = await network.create();
const { ethers, networkHelpers } = connection;
const { loadFixture } = networkHelpers;

describe("IAvatar", () => {
  after(async () => {
    await connection.close();
  });

  async function setupTests() {
    const [signer] = await ethers.getSigners();
    const Avatar = await ethers.getContractFactory("TestAvatar");
    const avatar = await Avatar.connect(signer).deploy();
    const iAvatar = (await ethers.getContractAt(
      "TestAvatar",
      await avatar.getAddress(),
      signer
    )) as any;
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
    it("allow to enable a module", async () => {
      const [user1] = await ethers.getSigners();
      const { iAvatar } = await loadFixture(setupTests);
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

  describe("disableModule", async () => {
    it("allow to disable a module", async () => {
      const { iAvatar } = await loadFixture(setupTests);
      const [user1] = await ethers.getSigners();

      await expect(await iAvatar.isModuleEnabled(user1.address)).to.be.equals(
        false
      );
      let transaction = await iAvatar.enableModule(user1.address);
      await transaction.wait();
      await expect(await iAvatar.isModuleEnabled(user1.address)).to.be.equals(
        true
      );
      transaction = await iAvatar.disableModule(ZeroAddress, user1.address);
      await transaction.wait();
      await expect(await iAvatar.isModuleEnabled(user1.address)).to.be.equals(
        false
      );
    });
  });

  describe("execTransactionFromModule", async () => {
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

    it("allow to execute module transaction", async () => {
      const { iAvatar, tx } = await setupTests();
      const [user1] = await ethers.getSigners();
      await iAvatar.enableModule(user1.address);
      await (
        await iAvatar.execTransactionFromModule(
          tx.to,
          tx.value,
          tx.data,
          tx.operation
        )
      ).wait();
    });
  });

  describe("execTransactionFromModuleReturnData", async () => {
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

    it("allow to execute module transaction and return data", async () => {
      const { iAvatar, tx } = await setupTests();
      const [user1] = await ethers.getSigners();
      await iAvatar.enableModule(user1.address);
      await (
        await iAvatar.execTransactionFromModuleReturnData(
          tx.to,
          tx.value,
          tx.data,
          tx.operation
        )
      ).wait();
    });
  });

  describe("isModuleEnabled", async () => {
    it("returns false if module has not been enabled", async () => {
      const { iAvatar } = await loadFixture(setupTests);
      const [user1] = await ethers.getSigners();
      await expect(await iAvatar.isModuleEnabled(user1.address)).to.be.equals(
        false
      );
    });

    it("returns true if module has been enabled", async () => {
      const { iAvatar } = await loadFixture(setupTests);
      const [user1] = await ethers.getSigners();
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
    it("returns array of enabled modules", async () => {
      const { iAvatar } = await loadFixture(setupTests);
      const [user1] = await ethers.getSigners();
      await iAvatar.enableModule(user1.address);
      const [array, next] = await iAvatar.getModulesPaginated(user1.address, 1);
      await expect(array.toString()).to.be.equals([user1.address].toString());
      await expect(next).to.be.equals(user1.address);
    });
  });
});
