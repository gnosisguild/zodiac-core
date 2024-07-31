export type RequestArguments = {
  readonly method: string;
  readonly params?: readonly unknown[] | object;
};

export type EIP1193Provider = {
  request: (args: RequestArguments) => Promise<unknown>;
};

export type Create2Args = {
  bytecode: string;
  constructorArgs: { types: any[]; values: any[] };
  salt: string;
};

export type BuildArtifact = {
  contractName: string;
  sourceName: string;
  compilerVersion: `v${string}`;
  compilerInput: any;
  bytecode: string;
  abi: any;
};

export type MastercopyArtifact = BuildArtifact & {
  factory: string;
  constructorArgs: {
    types: any[];
    values: any[];
  };
  salt: string;
  address: string;
};
