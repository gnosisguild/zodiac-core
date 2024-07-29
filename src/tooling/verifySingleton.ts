import predictSingletonAddress from "../encoding/predictSingletonAddress";
import verify from "./internal/verify";

export default async function verifySingleton({
  apiUrl,
  apiKey,
  bytecode,
  constructorArgs,
  salt,
  artifact,
}: {
  apiUrl: string;
  apiKey: string;
  bytecode: string;
  constructorArgs: { types: any[]; values: any[] };
  salt: string;
  artifact: {
    contractName: string;
    sourceName: string;
    compilerVersion: string;
    compilerInput: string;
  };
}) {
  const contractAddress = predictSingletonAddress({
    bytecode,
    constructorArgs,
    salt,
  });

  const { noop } = await verify(
    { ...artifact, constructorArgs, contractAddress },
    apiUrl,
    apiKey
  );

  if (noop) {
    console.log(`Singleton already verified`);
  } else {
    console.log(`Successfully verified Singleton`);
  }
}
