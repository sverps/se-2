import { Prettify } from "viem/dist/types/types/utils";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Head<T> = T extends readonly [infer I, ...infer _] ? I : never;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Tail<T> = T extends readonly [infer _, ...infer Rest] ? Rest : never;

type Unique<T, U> = Omit<T, keyof U>;

type Common<T, U> = Omit<T | U, keyof Unique<T, U> | keyof Unique<U, T>>;

type Combine<T, U> = Prettify<Unique<T, U> & Unique<U, T> & { [K in keyof Common<T, U>]: DeepMerge<T[K], U[K]> }>;

type DeepMerge<T, U> = [T, U] extends [{ [key: string]: unknown }, { [key: string]: unknown }] ? Combine<T, U> : T;

type CombineChainArray<T, U> = T extends readonly []
  ? U
  : U extends readonly []
  ? T
  : [DeepMerge<Head<T>, Head<U>>, ...CombineChainArray<Tail<T>, Tail<U>>];

export type MergeContractDefinitions<T, U> = Prettify<
  Unique<T, U> & Unique<U, T> & { [K in keyof Common<T, U>]: CombineChainArray<T[K], U[K]> }
>;
