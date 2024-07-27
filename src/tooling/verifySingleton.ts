import verify from "./internal/verify";

export default async function verifySingleton({
  apiUrl,
  apiKey,
  artifact,
}: {
  apiUrl: string;
  apiKey: string;
  artifact: {
    contractName: string;
    sourceName: string;
    contractAddress: string;
    compilerVersion: string;
    compilerInput: string;
    constructorArgs: { types: any[]; values: any[] };
  };
}) {
  const { noop } = await verify(artifact, apiUrl, apiKey);

  if (noop) {
    console.log(`Singleton already verified`);
  } else {
    console.log(`Successfully verified Singleton`);
  }
}
