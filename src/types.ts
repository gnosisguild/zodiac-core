export type Create2Args = {
  bytecode: string;
  constructorArgs: { types: any[]; values: any[] };
  salt: string;
};

export type MastercopyArtifact = {
  contractName: string;
  contractAddress: string;
  bytecode: `0x${string}`;
  constructorArgs: {
    types: any[];
    values: any[];
  };
  compilerInput: any;
  compilerVersion: `v${string}`;
};

export enum VerifyResult {
  OK,
  AlreadyVerified,
}
