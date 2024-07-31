import { AbiCoder, concat, TransactionRequest } from "ethers";
import {
  address as factoryAddress,
  iface as factoryInterface,
} from "../factory/erc2470Factory";
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
    data: factoryInterface.encodeFunctionData("deploy", [
      creationBytecode,
      salt,
    ]),
  };
}
