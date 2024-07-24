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
} from "./factories/proxyFactory";

export default function populateDeployProxy({
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

export function predictProxyAddress({
  factory = factoryAddress,
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
  const proxyInterface = new Interface([
    "function setUp(bytes memory initializeParams)",
  ]);

  return proxyInterface.encodeFunctionData("setUp", [
    AbiCoder.defaultAbiCoder().encode(setupArgs.types, setupArgs.values),
  ]);
}
