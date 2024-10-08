import { AbiCoder } from "ethers";

import { sourcePathFromSourceCode } from "./getBuildArtifact";
import { resolveApiUrl } from "./chainConfig";

/**
 * Verifies the contract on a blockchain explorer using the provided API.
 *
 * @param {Object} params - The function parameters.
 * @param {string} params.contractName - The name of the contract.
 * @param {string} params.sourceName - The source name of the contract.
 * @param {string} params.compilerVersion - The version of the compiler used.
 * @param {string} params.compilerInput - The compiler input in JSON format.
 * @param {string} params.address - The address of the deployed contract.
 * @param {Object} params.constructorArgs - The constructor arguments of the contract.
 * @param {any[]} params.constructorArgs.types - The types of the constructor arguments.
 * @param {any[]} params.constructorArgs.values - The values of the constructor arguments.
 * @param {string} apiUrlOrChainId - The API URL of the blockchain explorer or the chain id.
 * @param {string} apiKey - The API key for the blockchain explorer.
 * @returns {Promise<{ ok: boolean; noop: boolean }>} The verification result.
 * @throws {Error} If the API URL is unreachable, the API key is invalid, or the verification fails.
 */
export async function verifySourceCode({
  contractName,
  sourceName,
  compilerVersion,
  compilerInput,
  address,
  constructorArgs: { types, values },
  apiUrlOrChainId,
  apiKey,
}: {
  contractName: string;
  sourceName: string;
  compilerVersion: string;
  compilerInput: string;
  address: string;
  constructorArgs: { types: any[]; values: any[] };
  apiUrlOrChainId: string;
  apiKey: string;
}): Promise<{ noop: boolean }> {
  const url = resolveApiUrl(apiUrlOrChainId);

  if (!(await isLiveUrl(url))) {
    throw new Error(`Couldn't reach ${url}`);
  }

  if (!(await isValidApiKey({ url, apiKey }))) {
    throw new Error(`Invalid Api Key`);
  }

  if (await isVerified(address, { url, apiKey })) {
    return {
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
  const { status, message, result } = (await response.json()) as {
    status: number;
    message: string;
    result: string;
  };

  if (!isOk(status)) {
    throw new Error(`Verifying SourceCode: ${message} ${result}`);
  }

  return {
    noop: false,
  };
}

export async function getSourceCode({
  address,
  apiUrlOrChainId,
  apiKey,
}: {
  address: string;
  apiUrlOrChainId: string;
  apiKey: string;
}) {
  const url = resolveApiUrl(apiUrlOrChainId);

  if (!(await isLiveUrl(url))) {
    throw new Error(`Couldn't reach ${url}`);
  }

  if (!(await isValidApiKey({ url, apiKey }))) {
    throw new Error(`Invalid Api Key`);
  }

  const parameters = new URLSearchParams({
    apikey: apiKey,
    module: "contract",
    action: "getsourcecode",
    address,
  });

  const urlWithParams = new URL(url);
  urlWithParams.search = parameters.toString();

  const response = await fetch(urlWithParams, {
    method: "GET",
  });

  const { status, message, result } = (await response.json()) as {
    status: number;
    message: string;
    result: any;
  };

  if (!isOk(status)) {
    throw new Error(`Retrieve Error: ${status} ${message}`);
  }

  const abi = safeJsonParse(result[0].ABI);
  const compilerInput = safeJsonParse(result[0].SourceCode) as any;
  const contractName = result[0].ContractName as string;
  const sourceName = sourcePathFromSourceCode(compilerInput, contractName);

  if (!sourceName) {
    throw new Error(
      `Could not find a sourceName for contractName ${contractName}`
    );
  }

  return {
    compilerInput,
    compilerVersion: result[0].CompilerVersion,
    contractName,
    sourceName,
    abi,
  };
}

/**
 * Checks if the given URL is reachable.
 *
 * @param {string} url - The URL to check.
 * @returns {Promise<boolean>} True if the URL is reachable, false otherwise.
 */
async function isLiveUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok;
  } catch (error) {
    console.error(`Error pinging ${url}:`, error);
    return false;
  }
}

/**
 * Validates the given API key.
 *
 * @param {Object} params - The function parameters.
 * @param {string} params.url - The API URL.
 * @param {string} params.apiKey - The API key to validate.
 * @returns {Promise<boolean>} True if the API key is valid, false otherwise.
 */
async function isValidApiKey({
  url: _url,
  apiKey,
}: {
  url: string;
  apiKey: string;
}): Promise<boolean> {
  const parameters = new URLSearchParams({
    apikey: apiKey,
    module: "stats",
    action: "ethprice",
  });
  const url = new URL(_url);
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

/**
 * Checks if the contract at the given address is already verified.
 *
 * @param {string} address - The address of the contract.
 * @param {Object} params - The function parameters.
 * @param {string} params.url - The API URL.
 * @param {string} params.apiKey - The API key.
 * @returns {Promise<boolean>} True if the contract is verified, false otherwise.
 * @throws {Error} If the verification status cannot be determined.
 */
async function isVerified(
  address: string,
  { url: _url, apiKey }: { url: string; apiKey: string }
): Promise<boolean> {
  const parameters = new URLSearchParams({
    apikey: apiKey,
    module: "contract",
    action: "getsourcecode",
    address,
  });
  const url = new URL(_url);
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

/**
 * Checks if the given status code indicates a successful response.
 *
 * @param {number} status - The status code to check.
 * @returns {boolean} True if the status code indicates success, false otherwise.
 */
function isOk(status: number): boolean {
  return String(status) === "1";
}

/**
 * Parses a JSON string, handling cases where the string may be
 * improperly wrapped with extra braces `{}`.
 *
 * If the JSON is valid, it will be parsed directly.
 *
 */
function safeJsonParse(input: string): any {
  input = input.trim();

  try {
    return JSON.parse(input);
  } catch {
    input = input.replace(/^\{|\}$/g, "").trim();
    return JSON.parse(input);
  }
}
