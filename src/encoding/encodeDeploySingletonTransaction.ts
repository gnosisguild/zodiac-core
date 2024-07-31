import { AbiCoder, concat, TransactionRequest } from "ethers";

import {
  address as factoryAddress,
  iface as factoryInterface,
} from "../factory/erc2470Factory";
import { Create2Args } from "../types";

export default function encodeDeploySingletonTransaction({
  factory = factoryAddress,
  bytecode,
  constructorArgs,
  salt,
}: Create2Args & { factory?: string }): TransactionRequest {
  return {
    to: factory,
    data: factoryInterface.encodeFunctionData("deploy", [
      creationBytecode({ bytecode, constructorArgs }),
      salt,
    ]),
  };
}

export function creationBytecode({
  bytecode,
  constructorArgs,
}: Omit<Create2Args, "salt">) {
  const { types, values } = constructorArgs;
  return concat([bytecode, AbiCoder.defaultAbiCoder().encode(types, values)]);
}
