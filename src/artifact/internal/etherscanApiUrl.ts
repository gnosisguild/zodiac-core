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

export function resolveApiUrl(chainId: number, apiUrl?: string) {
  return (
    apiUrl ||
    apiUrls[chainId] ||
    `https://api.etherscan.io/v2/api?chainid=${chainId}`
  );
}
