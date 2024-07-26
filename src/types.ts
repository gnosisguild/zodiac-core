export type RequestArguments = {
  readonly method: string;
  readonly params?: readonly unknown[] | object;
};

export type EIP1193Provider = {
  request: (args: RequestArguments) => Promise<unknown>;
};

export type Signerish = {
  signTransaction: (tx: any) => Promise<string>;
};

export type Create2Args = {
  bytecode: string;
  constructorArgs: { types: any[]; values: any[] };
  salt: string;
};

export type BuildArtifact = {
  contractName: string;
  sourceName: string;
  bytecode: string;
  compilerInput: any;
  compilerVersion: `v${string}`;
};

export type MastercopyArtifact = BuildArtifact & {
  constructorArgs: {
    types: any[];
    values: any[];
  };
  salt: string;
  contractAddress: string;
};
