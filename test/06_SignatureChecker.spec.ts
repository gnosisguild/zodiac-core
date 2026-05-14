import { expect } from "chai";
import { type BigNumberish, ZeroAddress, keccak256, toUtf8Bytes } from "ethers";

import { network } from "hardhat";

import typedDataForTransaction from "./typedDataForTransaction";

type ModuleTx = {
  to: string;
  value: BigNumberish;
  data: string;
  operation: number;
  salt: string;
};

const connection = await network.create();
const { ethers, networkHelpers } = connection;
const { loadFixture } = networkHelpers;

describe("SignatureChecker", () => {
  after(async () => {
    await connection.close();
  });

  async function setup() {
    const [signer, relayer] = await ethers.getSigners();
    const TestSignature = await ethers.getContractFactory("TestSignature");
    const testSignature = await TestSignature.deploy();

    return {
      testSignature: (await ethers.getContractAt(
        "TestSignature",
        await testSignature.getAddress(),
        relayer
      )) as any,
      signer,
      relayer,
    };
  }

  function moduleTx(overrides: Partial<ModuleTx> = {}): ModuleTx {
    return {
      to: "0x0000000000000000000000000000000000000099",
      value: 0,
      data: "0x",
      operation: 0,
      salt: keccak256(toUtf8Bytes("default salt")),
      ...overrides,
    };
  }

  async function signEOA(contract: string, tx: ModuleTx) {
    const [signer] = await ethers.getSigners();
    const { domain, types, message } = typedDataForTransaction(
      { contract, chainId: 31337 },
      tx
    );
    return signer.signTypedData(domain, types, message);
  }

  it("recovers an EOA signature", async () => {
    const { testSignature, signer, relayer } = await loadFixture(setup);

    const tx = moduleTx({ salt: keccak256(toUtf8Bytes("hello salt")) });
    const sig = await signEOA(await testSignature.getAddress(), tx);

    await expect(
      relayer.sendTransaction(
        await testSignature.check.populateTransaction(
          tx.to,
          tx.value,
          tx.data,
          tx.operation,
          tx.salt,
          "0x"
        )
      )
    )
      .to.emit(testSignature, "Recovered")
      .withArgs(ZeroAddress);

    await expect(
      relayer.sendTransaction(
        await testSignature.check.populateTransaction(
          tx.to,
          tx.value,
          tx.data,
          tx.operation,
          tx.salt,
          sig
        )
      )
    )
      .to.emit(testSignature, "Recovered")
      .withArgs(signer.address);
  });

  it("recovers a signature over non-trivial ModuleTx fields", async () => {
    const { testSignature, signer, relayer } = await loadFixture(setup);

    const tx = moduleTx({
      to: "0x000000000000000000000000000000000000DEAD",
      value: 12345n,
      data: "0xbadfed",
      operation: 1,
      salt: keccak256(toUtf8Bytes("nontrivial")),
    });
    const sig = await signEOA(await testSignature.getAddress(), tx);

    await expect(
      relayer.sendTransaction(
        await testSignature.check.populateTransaction(
          tx.to,
          tx.value,
          tx.data,
          tx.operation,
          tx.salt,
          sig
        )
      )
    )
      .to.emit(testSignature, "Recovered")
      .withArgs(signer.address);
  });

  describe("contract signature", () => {
    function makeContractSignature(
      signerSpecificSignature: string,
      signer: string
    ) {
      return `0x${signer.slice(2)}${signerSpecificSignature.slice(2)}`;
    }

    it("uses the first 20 bytes as ERC1271 signer", async () => {
      const { testSignature, relayer } = await loadFixture(setup);

      const ContractSigner =
        await ethers.getContractFactory("ContractSignerYes");
      const signer = await (await ContractSigner.deploy()).getAddress();

      const tx = moduleTx();

      const sigUnknown = makeContractSignature(
        "0xdddddd",
        "0x1234567890000000000000000000000123456789"
      );
      const sigKnown = makeContractSignature("0xdddddd", signer);

      await expect(
        relayer.sendTransaction(
          await testSignature.check.populateTransaction(
            tx.to,
            tx.value,
            tx.data,
            tx.operation,
            tx.salt,
            sigUnknown
          )
        )
      )
        .to.emit(testSignature, "Recovered")
        .withArgs(ZeroAddress);

      await expect(
        relayer.sendTransaction(
          await testSignature.check.populateTransaction(
            tx.to,
            tx.value,
            tx.data,
            tx.operation,
            tx.salt,
            sigKnown
          )
        )
      )
        .to.emit(testSignature, "Recovered")
        .withArgs(signer);
    });

    it("signer returns isValid maybe", async () => {
      const { testSignature, relayer } = await loadFixture(setup);

      const ContractSigner = await ethers.getContractFactory(
        "ContractSignerMaybe"
      );
      const contractSigner = await ContractSigner.deploy();
      const signer = await contractSigner.getAddress();

      const tx = moduleTx();

      const sigGood = makeContractSignature("0x001122334455", signer);
      const sigBad = makeContractSignature("0x00112233445566", signer);

      await expect(
        relayer.sendTransaction(
          await testSignature.check.populateTransaction(
            tx.to,
            tx.value,
            tx.data,
            tx.operation,
            tx.salt,
            sigGood
          )
        )
      )
        .to.emit(testSignature, "Recovered")
        .withArgs(signer);

      await expect(
        relayer.sendTransaction(
          await testSignature.check.populateTransaction(
            tx.to,
            tx.value,
            tx.data,
            tx.operation,
            tx.salt,
            sigBad
          )
        )
      )
        .to.emit(testSignature, "Recovered")
        .withArgs(ZeroAddress);
    });

    it("signer returns isValid yes", async () => {
      const { testSignature, relayer } = await loadFixture(setup);

      const ContractSigner =
        await ethers.getContractFactory("ContractSignerYes");
      const signer = await (await ContractSigner.deploy()).getAddress();

      const tx = moduleTx();
      const sig = makeContractSignature("0xaabbccddeeff", signer);

      await expect(
        relayer.sendTransaction(
          await testSignature.check.populateTransaction(
            tx.to,
            tx.value,
            tx.data,
            tx.operation,
            tx.salt,
            sig
          )
        )
      )
        .to.emit(testSignature, "Recovered")
        .withArgs(signer);
    });

    it("signer returns isValid no", async () => {
      const { testSignature, relayer } = await loadFixture(setup);

      const ContractSigner =
        await ethers.getContractFactory("ContractSignerNo");
      const signer = await (await ContractSigner.deploy()).getAddress();

      const tx = moduleTx();
      const sig = makeContractSignature("0xaabbccddeeff", signer);

      await expect(
        relayer.sendTransaction(
          await testSignature.check.populateTransaction(
            tx.to,
            tx.value,
            tx.data,
            tx.operation,
            tx.salt,
            sig
          )
        )
      )
        .to.emit(testSignature, "Recovered")
        .withArgs(ZeroAddress);
    });

    it("signer returns isValid for empty specific signature only", async () => {
      const { testSignature, relayer } = await loadFixture(setup);

      const ContractSigner = await ethers.getContractFactory(
        "ContractSignerOnlyEmpty"
      );
      const signer = await (await ContractSigner.deploy()).getAddress();

      const tx = moduleTx();
      const sigGood = makeContractSignature("0x", signer);
      const sigBad = makeContractSignature("0xffff", signer);

      await expect(
        relayer.sendTransaction(
          await testSignature.check.populateTransaction(
            tx.to,
            tx.value,
            tx.data,
            tx.operation,
            tx.salt,
            sigGood
          )
        )
      )
        .to.emit(testSignature, "Recovered")
        .withArgs(signer);

      await expect(
        relayer.sendTransaction(
          await testSignature.check.populateTransaction(
            tx.to,
            tx.value,
            tx.data,
            tx.operation,
            tx.salt,
            sigBad
          )
        )
      )
        .to.emit(testSignature, "Recovered")
        .withArgs(ZeroAddress);
    });

    it("supports empty ERC1271 contract signatures", async () => {
      const { testSignature, relayer } = await loadFixture(setup);

      const ContractSigner = await ethers.getContractFactory(
        "ContractSignerOnlyEmpty"
      );
      const signer = await (await ContractSigner.deploy()).getAddress();

      const tx = moduleTx();
      const sig = makeContractSignature("0x", signer);

      expect((sig.length - 2) / 2).to.equal(20);

      await expect(
        relayer.sendTransaction(
          await testSignature.check.populateTransaction(
            tx.to,
            tx.value,
            tx.data,
            tx.operation,
            tx.salt,
            sig
          )
        )
      )
        .to.emit(testSignature, "Recovered")
        .withArgs(signer);
    });

    it("signer bad return size", async () => {
      const { testSignature, relayer } = await loadFixture(setup);

      const Signer = await ethers.getContractFactory(
        "ContractSignerReturnSize"
      );
      const signer = await (await Signer.deploy()).getAddress();

      const tx = moduleTx();
      const sig = makeContractSignature("0xaabbccddeeff", signer);

      await expect(
        relayer.sendTransaction(
          await testSignature.check.populateTransaction(
            tx.to,
            tx.value,
            tx.data,
            tx.operation,
            tx.salt,
            sig
          )
        )
      )
        .to.emit(testSignature, "Recovered")
        .withArgs(ZeroAddress);
    });

    it("signer with faulty entrypoint", async () => {
      const { testSignature, relayer } = await loadFixture(setup);

      const Signer = await ethers.getContractFactory("ContractSignerFaulty");
      const signer = await (await Signer.deploy()).getAddress();

      const tx = moduleTx();
      const sig = makeContractSignature("0xaabbccddeeff", signer);

      await expect(
        relayer.sendTransaction(
          await testSignature.check.populateTransaction(
            tx.to,
            tx.value,
            tx.data,
            tx.operation,
            tx.salt,
            sig
          )
        )
      )
        .to.emit(testSignature, "Recovered")
        .withArgs(ZeroAddress);
    });

    it("signer with no code deployed", async () => {
      const { testSignature, relayer } = await loadFixture(setup);

      const signerAddress = "0x1234567890000000000000000000000123456789";
      expect(await ethers.provider.getCode(signerAddress)).to.equal("0x");

      const tx = moduleTx();
      const sig = makeContractSignature("0xaabbccddeeff", signerAddress);

      await expect(
        relayer.sendTransaction(
          await testSignature.check.populateTransaction(
            tx.to,
            tx.value,
            tx.data,
            tx.operation,
            tx.salt,
            sig
          )
        )
      )
        .to.emit(testSignature, "Recovered")
        .withArgs(ZeroAddress);
    });
  });
});
