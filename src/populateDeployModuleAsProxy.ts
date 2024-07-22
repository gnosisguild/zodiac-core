import {
  AbiCoder,
  concat,
  getCreate2Address,
  keccak256,
  TransactionRequest,
} from "ethers";

import { address as moduleFactoryAddress } from "./factories/moduleFactory";

import {
  FactoryFriendly__factory,
  ModuleProxyFactory__factory,
} from "../typechain-types";

export default function populateDeployModuleAsProxy({
  factory = moduleFactoryAddress,
  mastercopy,
  setupArgs,
  salt,
}: {
  factory?: string;
  mastercopy: string;
  setupArgs: { types: any[]; values: any[] };
  salt: string;
}): TransactionRequest {
  const iface = ModuleProxyFactory__factory.createInterface();

  return {
    to: factory,
    data: iface.encodeFunctionData("deployModule", [
      mastercopy,
      initializer({ setupArgs }),
      salt,
    ]),
  };
}

export function predictAddress({
  factory = moduleFactoryAddress,
  mastercopy,
  setupArgs,
  salt,
}: {
  factory?: string;
  mastercopy: string;
  setupArgs: { types: any[]; values: any[] };
  salt: string;
}) {
  return getCreate2Address(
    factory,
    internalSalt({ setupArgs, salt }),
    keccak256(creationBytecode({ mastercopy }))
  );
}

function creationBytecode({ mastercopy }: { mastercopy: string }) {
  const left = "0x602d8060093d393df3363d3d373d3d3d363d73";
  const right = "5af43d82803e903d91602b57fd5bf3";
  const center = mastercopy.toLowerCase().replace(/^0x/, "");
  return `${left}${center}${right}`;
}

function internalSalt({
  setupArgs,
  salt,
}: {
  setupArgs: { types: any[]; values: any[] };
  salt: string;
}) {
  return keccak256(concat([keccak256(initializer({ setupArgs })), salt]));
}

function initializer({
  setupArgs,
}: {
  setupArgs: { types: any[]; values: any[] };
}) {
  const iface = FactoryFriendly__factory.createInterface();
  return iface.encodeFunctionData("setUp", [
    AbiCoder.defaultAbiCoder().encode(setupArgs.types, setupArgs.values),
  ]);
}
