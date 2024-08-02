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
  const url = resolveApiUrl(apiUrl);

  if (!(await isLiveUrl(url))) {
    throw new Error(`Couldn't reach ${url}`);
  }

  if (!(await isValidApiKey({ url, apiKey }))) {
    throw new Error(`Invalid Api Key`);
  }

  if (await isVerified(address, { url, apiKey })) {
    return {
      ok: true,
      noop: true,
    };
  }

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
    throw new Error(`Verification Error: ${status} ${message}`);
  }

  return {
    ok: true,
    noop: false,
  };
}

async function isLiveUrl(url: URL) {
  try {
    const response = await fetch(url, { method: "HEAD" });
    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error(`Error pinging ${url}:`, error);
    return false;
  }
}

async function isValidApiKey({ url, apiKey }: { url: URL; apiKey: string }) {
  const parameters = new URLSearchParams({
    apikey: apiKey,
    module: "stats",
    action: "ethprice",
  });
  url.search = parameters.toString();

  const response = await fetch(url, {
    method: "GET",
  });

  if (!response.ok) {
    return false;
  }

  const json = await response.json();
  return isOk(json.status);
}

async function isVerified(
  address: string,
  { url, apiKey }: { url: URL; apiKey: string }
) {
  const parameters = new URLSearchParams({
    apikey: apiKey,
    module: "contract",
    action: "getsourcecode",
    address,
  });
  url.search = parameters.toString();

  const response = await fetch(url, {
    method: "GET",
  });

  const json = await response.json();

  if (!isOk(json.status)) {
    throw new Error(`IsVerified: ${json.message} ${json.result}`);
  }

  const sourceCode = json.result[0]?.SourceCode;
  return Boolean(sourceCode);
}

function isOk(status: number) {
  return String(status) == String(1);
}
