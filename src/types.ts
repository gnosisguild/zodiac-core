export interface RequestArguments {
  method: string;
  params: unknown[];
}

export type EIP1193RequestFunc = (args: RequestArguments) => Promise<unknown>;
