import { AbiCoder } from "ethers";

import { ApiConfig, resolveApiConfig } from "./config";

import { MastercopyArtifact } from "../../types";

export default async function verify(
  artifact: MastercopyArtifact,
  config: ApiConfig
): Promise<{ ok: boolean; noop: boolean }> {
  const {
    contractName,
    contractAddress,
    compilerVersion,
    compilerInput,
    constructorArgs: { types, values },
  } = artifact;

  const { apiKey, apiUrl } = resolveApiConfig(config);

  const url = new URL(apiUrl);

  const parameters = new URLSearchParams({
    apikey: apiKey,
    module: "contract",
    action: "verifysourcecode",
    contractaddress: contractAddress,
    sourceCode: JSON.stringify(compilerInput),
    codeformat: "solidity-standard-json-input",
    contractname: contractName,
    compilerversion: compilerVersion,
    constructorArguements: AbiCoder.defaultAbiCoder()
      .encode(types, values)
      .slice(2),
  });

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: parameters.toString(),
  });
  const { status, message } = (await response.json()) as {
    status: number;
    message: string;
  };

  if (!isOk(status)) {
    throw new Error(`Verification Error: ${message}`);
  }

  return {
    ok: true,
    noop: isAlreadyVerified(message),
  };
}

function isOk(status: number) {
  return status === 1;
}

function isAlreadyVerified(message: string) {
  return (
    // returned by blockscout
    message.startsWith("Smart-contract already verified") ||
    // returned by etherscan
    message.startsWith("Contract source code already verified") ||
    message.startsWith("Already Verified")
  );
}

// function isSuccess(message: string) {
//   return message === "Pass - Verified";
// }

// interface EtherscanContract {
//   SourceCode: string;
//   ABI: string;
//   ContractName: string;
//   CompilerVersion: string;
//   OptimizationUsed: string;
//   Runs: string;
//   ConstructorArguments: string;
//   EVMVersion: string;
//   Library: string;
//   LicenseType: string;
//   Proxy: string;
//   Implementation: string;
//   SwarmSource: string;
// }
