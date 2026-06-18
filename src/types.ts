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
