import { AbiCoder, concat, getCreate2Address, keccak256 } from "ethers";

import { address as factoryAddress } from "../factories/singletonFactory";

import { Create2Args } from "../types";

export default function predictSingletonAddress({
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
