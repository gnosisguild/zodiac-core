import { AbiCoder, concat, getCreate2Address, keccak256 } from "ethers";
import { address as singletonFactoryAddress } from "./factories/singletonFactory";

import { Create2Args } from "./types";
import { SingletonFactory__factory } from "../typechain-types";

export default function populateDeployMastercopy({
  bytecode,
  constructorArgs,
  salt,
}: Create2Args) {
  const iface = SingletonFactory__factory.createInterface();
  return {
    to: singletonFactoryAddress,
    data: iface.encodeFunctionData("deploy", [
      creationBytecode({ bytecode, constructorArgs }),
      salt,
    ]),
  };
}

export function predictAddress({
  bytecode,
  constructorArgs,
  salt,
}: Create2Args) {
  return getCreate2Address(
    singletonFactoryAddress,
    salt,
    keccak256(creationBytecode({ bytecode, constructorArgs }))
  );
}

function creationBytecode({
  bytecode,
  constructorArgs,
}: Omit<Create2Args, "salt">) {
  const { types, values } = constructorArgs;
  return concat([bytecode, new AbiCoder().encode(types, values)]);
}
