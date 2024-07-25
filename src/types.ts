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

export type MastercopyArtifact = {
  contractName: string;
  contractAddress: string;
  bytecode: string;
  constructorArgs: {
    types: any[];
    values: any[];
  };
  salt: string;
  compilerInput: any;
  compilerVersion: `v${string}`;
};

export enum VerifyResult {
  OK,
  AlreadyVerified,
}
