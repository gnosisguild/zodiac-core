import { AbiCoder } from "ethers";

import { resolveApiUrl } from "../../artifact/internal/chainConfig";

export default async function verify(
  {
    contractName,
    sourceName,
    compilerVersion,
    compilerInput,
    address,
    constructorArgs: { types, values },
  }: {
    contractName: string;
    sourceName: string;
    compilerVersion: string;
    compilerInput: string;
    address: string;
    constructorArgs: { types: any[]; values: any[] };
  },
  apiUrl: string,
  apiKey: string
): Promise<{ ok: boolean; noop: boolean }> {
  if (await isVerified(address, apiUrl, apiKey))
    return {
      ok: true,
      noop: true,
    };

  const url = new URL(resolveApiUrl(apiUrl));

  const parameters = new URLSearchParams({
    apikey: apiKey,
    module: "contract",
    action: "verifysourcecode",
    contractaddress: address,
    sourceCode: JSON.stringify(compilerInput),
    codeformat: "solidity-standard-json-input",
    contractname: `${sourceName}:${contractName}`,
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
    noop: false,
  };
}

async function isVerified(
  contractAddress: string,
  apiUrl: string,
  apiKey: string
) {
  const url = new URL(resolveApiUrl(apiUrl));

  const parameters = new URLSearchParams({
    apikey: apiKey,
    module: "contract",
    action: "getsourcecode",
    address: contractAddress,
  });
  url.search = parameters.toString();

  const response = await fetch(url, {
    method: "GET",
  });

  const json = await response.json();

  if (!isOk(json.status)) {
    throw new Error(`IsVerified: ${json.message}`);
  }

  const sourceCode = json.result[0]?.SourceCode;
  return Boolean(sourceCode);
}

function isOk(status: number) {
  return String(status) == String(1);
}
