import { AbiCoder } from "ethers";

/**
 * Verifies the contract on a blockchain explorer using the provided API.
 *
 * @param {Object} params - The function parameters.
 * @param {string} params.contractName - The name of the contract.
 * @param {string} params.sourceName - The source name of the contract.
 * @param {string} params.compilerVersion - The version of the compiler used.
 * @param {Object} params.compilerInput - The compiler input in standard JSON format.
 * @param {string} params.address - The address of the deployed contract.
 * @param {Object} params.constructorArgs - The constructor arguments of the contract.
 * @param {string[]} params.constructorArgs.types - The types of the constructor arguments.
 * @param {unknown[]} params.constructorArgs.values - The values of the constructor arguments.
 * @param {number} chainId - The chain ID.
 * @param {string} apiKey - The API key for the blockchain explorer.
 * @param {string} [apiUrl] - Optional custom API URL. If not provided, will use the default for the chain.
 *
 * @returns {Promise<{ noop: boolean }>} The verification result.
 * @throws {Error} If the API URL is unreachable, the API key is invalid, or the verification fails.
 */
export async function verifySourceCode({
  contractName,
  sourceName,
  compilerVersion,
  compilerInput,
  address,
  constructorArgs: { types, values },
  chainId,
  apiKey,
  apiUrl,
}: {
  contractName: string;
  sourceName: string;
  compilerVersion: string;
  compilerInput: unknown;
  address: string;
  constructorArgs: {
    types: readonly string[];
    values: readonly unknown[];
  };
  chainId: number;
  apiKey: string;
  apiUrl?: string;
}): Promise<{ noop: boolean }> {
  const url = resolveApiUrl(chainId, apiUrl);

  if (!(await isLiveUrl(url))) {
    throw new Error(`Couldn't reach ${url}`);
  }

  if (!(await isValidApiKey({ url, apiKey, chainId }))) {
    throw new Error(`Invalid Api Key`);
  }

  if (await isVerified(address, { url, apiKey, chainId })) {
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

/**
 * Checks if the given URL is reachable using HEAD first, then OPTIONS.
 *
 * @param {string} url - The URL to check.
 * @returns {Promise<boolean>} True if the URL is reachable, false otherwise.
 */
async function isLiveUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: "HEAD" });
    if (response.ok) return true;
  } catch (error) {
    console.warn(`HEAD request failed for ${url}, trying OPTIONS...`);
  }

  try {
    const response = await fetch(url, { method: "OPTIONS" });
    return response.status < 500;
  } catch (error) {
    console.error(`Both HEAD and OPTIONS failed for ${url}:`, error);
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
  chainId,
  apiKey,
}: {
  url: string;
  chainId: number;
  apiKey: string;
}): Promise<boolean> {
  const parameters = new URLSearchParams({
    chainid: chainId.toString(),
    apikey: apiKey,
    module: "account",
    action: "balance",
    address: "0x0000000000000000000000000000000000000000",
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
  {
    url: _url,
    apiKey,
    chainId,
  }: { url: string; apiKey: string; chainId: number }
): Promise<boolean> {
  const parameters = new URLSearchParams({
    apikey: apiKey,
    chainid: chainId.toString(),
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

const apiUrls: Record<number, string | undefined> = {
  [77]: "https://blockscout.com/poa/sokol/api",
  [128]: "https://api.hecoinfo.com/api",
  [250]: "https://api.ftmscan.com/api",
  [256]: "https://api-testnet.hecoinfo.com/api",
  [1135]: "https://blockscout.lisk.com/api",
  [10200]: "https://gnosis-chiado.blockscout.com/api",
  [43113]: "https://api-testnet.snowtrace.io/api",
  [60808]: "https://explorer.gobob.xyz/api",
  [80001]: "https://api-testnet.polygonscan.com/api",
  [80002]: "https://api-amoy.polygonscan.com/api",
  [808813]: "https://bob-sepolia.explorer.gobob.xyz/api",
  [1313161554]: "https://explorer.mainnet.aurora.dev/api",
  [1313161555]: "https://explorer.testnet.aurora.dev/api",
  [1666600000]: "https://ctrver.t.hmny.io/verify",
  [1666700000]: "https://ctrver.t.hmny.io/verify?network=testnet",
};

function resolveApiUrl(chainId: number, apiUrl?: string) {
  return (
    apiUrl ||
    apiUrls[chainId] ||
    `https://api.etherscan.io/v2/api?chainid=${chainId}`
  );
}
