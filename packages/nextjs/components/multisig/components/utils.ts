import { SignedTransaction } from "../hooks/useCreateSignedTransaction";

export function stringifySignedTransaction(transaction: SignedTransaction) {
  return JSON.stringify({
    ...transaction,
    args: (Object.entries(transaction.args) as [keyof SignedTransaction["args"], any][]).reduce(
      (args, [argKey, argValue]) => {
        args[argKey] = argValue?.toString();
        return args;
      },
      {} as SignedTransaction["args"],
    ),
  });
}
