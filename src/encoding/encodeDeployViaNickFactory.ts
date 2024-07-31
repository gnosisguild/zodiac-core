import { AbiCoder, concat, TransactionRequest } from "ethers";
import { address as factoryAddress } from "../factory/nickFactory";
import { Create2Args } from "../types";

export default function encodeDeployTransaction({
  factory = factoryAddress,
  bytecode,
  constructorArgs: { types, values },
  salt,
}: Create2Args & { factory?: string }): TransactionRequest {
  const creationBytecode = concat([
    bytecode,
    AbiCoder.defaultAbiCoder().encode(types, values),
  ]);

  return {
    to: factory,
    data: concat([salt, creationBytecode]),
  };
}
