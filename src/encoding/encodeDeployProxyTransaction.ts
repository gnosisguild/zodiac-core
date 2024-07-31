import { AbiCoder, BigNumberish, Interface, TransactionRequest } from "ethers";

import {
  address as factoryAddress,
  iface as factoryIFace,
} from "../factory/proxyFactory";

export default function encodeDeployProxyTransaction({
  factory = factoryAddress,
  mastercopy,
  setupArgs,
  saltNonce,
}: {
  factory?: string;
  mastercopy: string;
  setupArgs: { types: any[]; values: any[] };
  saltNonce: BigNumberish;
}): TransactionRequest {
  return {
    to: factory,
    data: factoryIFace.encodeFunctionData("deployModule", [
      mastercopy,
      initializer({ setupArgs }),
      saltNonce,
    ]),
  };
}

export function creationBytecode({ mastercopy }: { mastercopy: string }) {
  const left = "0x602d8060093d393df3363d3d373d3d3d363d73";
  const right = "5af43d82803e903d91602b57fd5bf3";
  const center = mastercopy.toLowerCase().replace(/^0x/, "");
  return `${left}${center}${right}`;
}

export function initializer({
  setupArgs,
}: {
  setupArgs: { types: any[]; values: any[] };
}) {
  const proxyInterface = new Interface([
    "function setUp(bytes memory initializeParams)",
  ]);

  return proxyInterface.encodeFunctionData("setUp", [
    AbiCoder.defaultAbiCoder().encode(setupArgs.types, setupArgs.values),
  ]);
}
