import { AbiCoder, concat, getCreate2Address, keccak256 } from "ethers";
import { address as factoryAddress } from "../factory/erc2470Factory";
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
  constructorArgs: { types, values },
}: {
  bytecode: string;
  constructorArgs: { types: any[]; values: any[] };
}) {
  return concat([bytecode, AbiCoder.defaultAbiCoder().encode(types, values)]);
}
