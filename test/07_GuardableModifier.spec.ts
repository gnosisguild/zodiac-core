import { expect } from "chai";
import { type BigNumberish, type Signer, keccak256, toUtf8Bytes } from "ethers";

import { network } from "hardhat";

import typedDataForTransaction from "./typedDataForTransaction";

type ModuleTx = {
  to: string;
  value: BigNumberish;
  data: string;
  operation: number;
};

const connection = await network.create();
const { ethers, networkHelpers } = connection;
const { loadFixture } = networkHelpers;

describe("GuardableModifier", () => {
  after(async () => {
    await connection.close();
  });

  /**
   * Sets up the test environment by deploying the necessary contracts.
   *
   * @returns {Promise<{ executor: any, signer: any, someone: any, relayer: any, avatar: any, guard: any, modifier: any }>} The deployed contract instances and test signers.
   */
  async function setupTests() {
    const [deployer, executor, signer, someone, relayer] =
      await ethers.getSigners();

    const Avatar = await ethers.getContractFactory("TestAvatar");
    const avatar = (await ethers.getContractAt(
      "TestAvatar",
      await (await Avatar.deploy()).getAddress(),
      deployer
    )) as any;

    const Modifier = await ethers.getContractFactory("TestGuardableModifier");
    const modifier = (await ethers.getContractAt(
      "TestGuardableModifier",
      await (
        await Modifier.connect(deployer).deploy(
          await avatar.getAddress(),
          await avatar.getAddress()
        )
      ).getAddress(),
      deployer
    )) as any;
    const Guard = await ethers.getContractFactory("TestGuard");
    const guard = (await ethers.getContractAt(
      "TestGuard",
      await (await Guard.deploy(await modifier.getAddress())).getAddress(),
      deployer
    )) as any;

    await avatar.enableModule(await modifier.getAddress());
    await modifier.enableModule(await executor.getAddress());

    return {
      executor,
      signer,
      someone,
      relayer,
      avatar,
      guard,
      modifier,
    };
  }

  describe("exec", async () => {
    /**
     * Tests executing a transaction without a guard.
     * Verifies that the transaction does not revert if no guard is set.
     */
    it("skips guard pre-check if no guard is set", async () => {
      const { avatar, modifier, executor } = await loadFixture(setupTests);

      await expect(
        modifier
          .connect(executor)
          .execTransactionFromModule(await avatar.getAddress(), 0, "0x", 0)
      ).to.not.be.revert(ethers);
    });

    /**
     * Tests executing a transaction with a guard set.
     * Verifies that the guard's pre-check is called and emits the PreChecked event with the executor address.
     */
    it("pre-checks transaction if guard is set", async () => {
      const { avatar, executor, modifier, guard } =
        await loadFixture(setupTests);
      await modifier.setGuard(await guard.getAddress());

      await expect(
        modifier
          .connect(executor)
          .execTransactionFromModule(await avatar.getAddress(), 0, "0x", 0)
      )
        .to.emit(guard, "PreChecked")
        .withArgs(await executor.getAddress());
    });

    /**
     * Tests executing a relayed transaction with a guard set.
     * Verifies that the guard's pre-check is called with the signer's address (via sentOrSignedByModule).
     */
    it("pre-check gets called with signer address when transaction is relayed", async () => {
      const { signer, modifier, relayer, avatar, guard } =
        await loadFixture(setupTests);

      await modifier.enableModule(await signer.getAddress());
      await modifier.setGuard(await guard.getAddress());

      const inner = await avatar.enableModule.populateTransaction(
        "0xff00000000000000000000000000000000ff3456"
      );

      const tx: ModuleTx = {
        to: await avatar.getAddress(),
        value: 0,
        data: inner.data as string,
        operation: 0,
      };
      const salt = keccak256(toUtf8Bytes("salt"));

      const signature = await sign(
        await modifier.getAddress(),
        tx,
        salt,
        signer
      );
      const transactionWithSig =
        await modifier.execTransactionFromModuleSigned.populateTransaction(
          tx,
          salt,
          signature
        );

      await expect(await relayer.sendTransaction(transactionWithSig))
        .to.emit(guard, "PreChecked")
        .withArgs(await signer.getAddress());
    });

    /**
     * Tests executing a transaction with a guard set.
     * Verifies that the transaction is pre-checked and reverts if the guard's conditions are not met.
     */
    it("pre-checks and reverts transaction if guard is set", async () => {
      const { avatar, executor, modifier, guard } =
        await loadFixture(setupTests);
      await modifier.setGuard(await guard.getAddress());

      await expect(
        modifier
          .connect(executor)
          .execTransactionFromModule(await avatar.getAddress(), 1337, "0x", 0)
      ).to.be.revertedWith("Cannot send 1337");
    });

    /**
     * Tests executing a transaction without a post-check guard.
     * Verifies that the guard's post-check is not called if no guard is set.
     */
    it("skips post-check if no guard is enabled", async () => {
      const { avatar, executor, modifier, guard } =
        await loadFixture(setupTests);

      await expect(
        modifier
          .connect(executor)
          .execTransactionFromModule(await avatar.getAddress(), 0, "0x", 0)
      ).not.to.emit(guard, "PostChecked");
    });

    /**
     * Tests executing a transaction with a guard set.
     * Verifies that the guard's post-check is called and emits the PostChecked event.
     */
    it("post-checks transaction if guard is set", async () => {
      const { avatar, executor, modifier, guard } =
        await loadFixture(setupTests);
      await modifier.setGuard(await guard.getAddress());

      await expect(
        modifier
          .connect(executor)
          .execTransactionFromModule(await avatar.getAddress(), 0, "0x", 0)
      )
        .to.emit(guard, "PostChecked")
        .withArgs(true);
    });
  });

  describe("execAndReturnData", async () => {
    /**
     * Tests executing a transaction that returns data without a guard.
     * Verifies that the transaction does not revert if no guard is set.
     */
    it("skips guard pre-check if no guard is set", async () => {
      const { avatar, modifier, executor } = await loadFixture(setupTests);

      await expect(
        modifier
          .connect(executor)
          .execTransactionFromModuleReturnData(
            await avatar.getAddress(),
            0,
            "0x",
            0
          )
      ).to.not.be.revert(ethers);
    });

    /**
     * Tests executing a transaction that returns data with a guard set.
     * Verifies that the guard's pre-check is called and emits the PreChecked event.
     */
    it("pre-checks transaction if guard is set", async () => {
      const { avatar, executor, modifier, guard } =
        await loadFixture(setupTests);
      await modifier.setGuard(await guard.getAddress());

      await expect(
        modifier
          .connect(executor)
          .execTransactionFromModuleReturnData(
            await avatar.getAddress(),
            0,
            "0x",
            0
          )
      )
        .to.emit(guard, "PreChecked")
        .withArgs(await executor.getAddress());
    });

    /**
     * Tests executing a relayed transaction that returns data with a guard set.
     * Verifies that the guard's pre-check is called with the signer's address.
     */
    it("pre-check gets called with signer address when return-data transaction is relayed", async () => {
      const { signer, modifier, relayer, avatar, guard } =
        await loadFixture(setupTests);

      await modifier.enableModule(signer.address);
      await modifier.setGuard(await guard.getAddress());

      const inner = await avatar.enableModule.populateTransaction(
        "0xff00000000000000000000000000000000ff3456"
      );

      const tx: ModuleTx = {
        to: await avatar.getAddress(),
        value: 0,
        data: inner.data as string,
        operation: 0,
      };
      const salt = keccak256(toUtf8Bytes("salt"));

      const signature = await sign(
        await modifier.getAddress(),
        tx,
        salt,
        signer
      );
      const transactionWithSig =
        await modifier.execTransactionFromModuleReturnDataSigned.populateTransaction(
          tx,
          salt,
          signature
        );

      await expect(await relayer.sendTransaction(transactionWithSig))
        .to.emit(guard, "PreChecked")
        .withArgs(await signer.getAddress());
    });

    /**
     * Tests executing a transaction that returns data with a guard set.
     * Verifies that the transaction is pre-checked and reverts if the guard's conditions are not met.
     */
    it("pre-checks and reverts transaction if guard is set", async () => {
      const { avatar, executor, modifier, guard } =
        await loadFixture(setupTests);
      await modifier.setGuard(await guard.getAddress());

      await expect(
        modifier
          .connect(executor)
          .execTransactionFromModuleReturnData(
            await avatar.getAddress(),
            1337,
            "0x",
            0
          )
      ).to.be.revertedWith("Cannot send 1337");
    });

    /**
     * Tests executing a transaction that returns data without a post-check guard.
     * Verifies that the guard's post-check is not called if no guard is set.
     */
    it("skips post-check if no guard is enabled", async () => {
      const { avatar, executor, modifier, guard } =
        await loadFixture(setupTests);

      await expect(
        modifier
          .connect(executor)
          .execTransactionFromModuleReturnData(
            await avatar.getAddress(),
            0,
            "0x",
            0
          )
      ).not.to.emit(guard, "PostChecked");
    });

    /**
     * Tests executing a transaction that returns data with a guard set.
     * Verifies that the guard's post-check is called and emits the PostChecked event.
     */
    it("post-checks transaction if guard is set", async () => {
      const { avatar, executor, modifier, guard } =
        await loadFixture(setupTests);
      await modifier.setGuard(await guard.getAddress());

      await expect(
        modifier
          .connect(executor)
          .execTransactionFromModuleReturnData(
            await avatar.getAddress(),
            0,
            "0x",
            0
          )
      )
        .to.emit(guard, "PostChecked")
        .withArgs(true);
    });
  });
});
/**
 *	Signs a transaction using the given signer.
 *
 *	@param {string} contract - The contract address.
 *	@param {TransactionLike} transaction - The transaction to be signed.
 *	@param {string} salt - The salt used for signing.
 *	@param {Signer} signer - The signer used to sign the transaction.
 *	@returns {Promise} The signed transaction.
 */
async function sign(
  contract: string,
  tx: ModuleTx,
  salt: string,
  signer: Signer
) {
  const { domain, types, message } = typedDataForTransaction(
    { contract, chainId: 31337 },
    { ...tx, salt }
  );

  return signer.signTypedData(domain, types, message);
}
