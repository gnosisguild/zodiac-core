import {
  AbiCoder,
  concat,
  getCreate2Address,
  keccak256,
  TransactionRequest,
} from "ethers";

import { SingletonFactory__factory } from "../typechain-types";

import { address as singletonFactoryAddress } from "./factories/singletonFactory";
import { Create2Args } from "./types";

export default function populateDeployMastercopy({
  factory = singletonFactoryAddress,
  bytecode,
  constructorArgs,
  salt,
}: Create2Args & { factory?: string }): TransactionRequest {
  const iface = SingletonFactory__factory.createInterface();
  return {
    to: factory,
    data: iface.encodeFunctionData("deploy", [
      creationBytecode({ bytecode, constructorArgs }),
      salt,
    ]),
  };
}

export function predictMastercopyAddress({
  factory = singletonFactoryAddress,
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

function creationBytecode({
  bytecode,
  constructorArgs,
}: Omit<Create2Args, "salt">) {
  const { types, values } = constructorArgs;
  return concat([bytecode, AbiCoder.defaultAbiCoder().encode(types, values)]);
}
