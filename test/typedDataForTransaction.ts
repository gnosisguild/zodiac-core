import type { BigNumberish } from "ethers";

export default function typedDataForTransaction(
  {
    contract,
    chainId,
  }: {
    contract: string;
    chainId: BigNumberish;
  },
  moduleTx: {
    to: string;
    value: BigNumberish;
    data: string;
    operation: number;
    salt: string;
  }
) {
  const domain = { verifyingContract: contract, chainId };
  const types = {
    ModuleTx: [
      { type: "address", name: "to" },
      { type: "uint256", name: "value" },
      { type: "bytes", name: "data" },
      { type: "uint8", name: "operation" },
      { type: "bytes32", name: "salt" },
    ],
  };
  const message = moduleTx;

  return { domain, types, message };
}
