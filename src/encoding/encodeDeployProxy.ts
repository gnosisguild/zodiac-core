import {
  AbiCoder,
  BigNumberish,
  concat,
  getCreate2Address,
  Interface,
  keccak256,
  TransactionRequest,
} from "ethers";

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

function initializer({
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
