import {
  AbiCoder,
  concat,
  getCreate2Address,
  keccak256,
  TransactionRequest,
} from "ethers";

import {
  address as factoryAddress,
  iface as factoryInterface,
} from "./factories/singletonFactory";
import { Create2Args } from "./types";

export default function populateDeployMastercopy({
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

export function predictMastercopyAddress({
  factory = factoryAddress,
  bytecode,
  constructorArgs,
  salt,
}: Create2Args & { factory?: string }) {
  return getCreate2Address(
    factory,
    salt,
    keccak256(creationBytecode({ bytecode, constructorArgs }))
  );
}

export function creationBytecode({
  bytecode,
  constructorArgs,
}: Omit<Create2Args, "salt">) {
  const { types, values } = constructorArgs;
  return concat([bytecode, AbiCoder.defaultAbiCoder().encode(types, values)]);
}
