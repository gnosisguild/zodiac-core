import {
  AbiCoder,
  BigNumberish,
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
  saltNonce,
}: {
  factory?: string;
  mastercopy: string;
  setupArgs: { types: any[]; values: any[] };
  saltNonce: BigNumberish;
}): TransactionRequest {
  const iface = ModuleProxyFactory__factory.createInterface();
  return {
    to: factory,
    data: iface.encodeFunctionData("deployModule", [
      mastercopy,
      initializer({ setupArgs }),
      saltNonce,
    ]),
  };
}

export function predictModuleProxyAddress({
  factory = moduleFactoryAddress,
  mastercopy,
  setupArgs,
  saltNonce,
}: {
  factory?: string;
  mastercopy: string;
  setupArgs: { types: any[]; values: any[] };
  saltNonce: BigNumberish;
}) {
  const salt = keccak256(
    concat([
      keccak256(initializer({ setupArgs })),
      AbiCoder.defaultAbiCoder().encode(["uint256"], [saltNonce]),
    ])
  );
  return getCreate2Address(
    factory,
    salt,
    keccak256(creationBytecode({ mastercopy }))
  );
}

function creationBytecode({ mastercopy }: { mastercopy: string }) {
  const left = "0x602d8060093d393df3363d3d373d3d3d363d73";
  const right = "5af43d82803e903d91602b57fd5bf3";
  const center = mastercopy.toLowerCase().replace(/^0x/, "");
  return `${left}${center}${right}`;
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
