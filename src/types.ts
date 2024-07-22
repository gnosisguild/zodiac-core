export type Create2Args = {
  bytecode: string;
  constructorArgs: { types: any[]; values: any[] };
  salt: string;
};
