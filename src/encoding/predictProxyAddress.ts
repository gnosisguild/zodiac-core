import {
  AbiCoder,
  BigNumberish,
  concat,
  getCreate2Address,
  keccak256,
} from "ethers";

import { creationBytecode, initializer } from "./encodeDeployProxyTransaction";
import { address as factoryAddress } from "../factories/proxyFactory";

export default function predictProxyAddress({
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
