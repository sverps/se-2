import { useEffect } from "react";
import { SignedTransaction, useCreateSignedTransaction } from "../hooks/useCreateSignedTransaction";
import { useDecodeCalldata } from "../hooks/useDecodeCalldata";
import { Actions } from "./Actions";
import { stringifySignedTransaction } from "./utils";
import { BigNumber } from "ethers";
import { useMutation, useQueryClient } from "wagmi";
import { useDeployedContractInfo, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

export type StoredTransaction = {
  contractAddress: string;
  chainId: number;
  hash: any;
  signatures: `0x${string}`[];
  functionName?: string;
  args: {
    nonce: string | BigNumber;
    to: string | undefined;
    amount: string | BigNumber;
    data: string;
  };
};

type TransactionProps = {
  transaction: StoredTransaction;
  signaturesRequired: number;
};

export const Transaction = ({ transaction, signaturesRequired }: TransactionProps) => {
  const { decodedCalldata } = useDecodeCalldata({
    functionName: transaction.functionName,
    calldata: transaction.args.data,
  });

  const queryClient = useQueryClient();
  const { data: contractData } = useDeployedContractInfo("MultisigWallet");
  const { write: submitTransaction } = useScaffoldContractWrite({
    contractName: "MultisigWallet",
    functionName: "executeTransaction",
    args: [
      contractData?.address,
      BigNumber.from(transaction.args?.amount),
      transaction.args?.data as `0x${string}`,
      transaction.signatures,
    ],
  });

  const {
    transaction: signedTransaction,
    error,
    createSignedTransaction: signTransaction,
  } = useCreateSignedTransaction({
    to: transaction.args.to,
    amount: transaction.args.amount,
    data: transaction.args.data,
  });

  const { mutate: saveSignedTransaction } = useMutation({
    mutationFn: async (newTx: SignedTransaction) => {
      if (!signedTransaction) {
        return;
      }
      return fetch("/api/storage", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: stringifySignedTransaction({ ...transaction, signature: newTx.signature }),
      });
    },
    onSuccess: () => {
      // TODO: use variables to update cache instead of relaunching query
      queryClient.invalidateQueries({ queryKey: ["TRANSACTIONS"] });
    },
  });
  useEffect(() => {
    if (signedTransaction && !error && !transaction.signatures.includes(signedTransaction.signature)) {
      saveSignedTransaction(signedTransaction);
    }
  }, [error, saveSignedTransaction, signedTransaction, transaction.signatures]);

  return (
    <div className="flex flex-col gap-4 py-6 first:pt-0 last:pb-0">
      <div className="flex w-full items-center">
        <div className="flex-1">
          <div className="font-bold">{transaction.functionName ?? "send ether"}</div>
          {decodedCalldata &&
            Object.entries(decodedCalldata)
              .filter(([key]) => !Number.isInteger(Number(key)))
              .map(([key, value]) => (
                <div key={key}>
                  {key}: {value.toString()}
                </div>
              ))}
        </div>
        <div>
          <div>{`Signatures: ${transaction.signatures?.length} / ${signaturesRequired}`}</div>
        </div>
      </div>
      <Actions>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => {
            signTransaction();
          }}
        >
          Sign tx
        </button>
        {submitTransaction && (
          <button
            className="btn btn-secondary btn-sm"
            disabled={transaction.signatures.length < signaturesRequired}
            onClick={() => {
              submitTransaction();
            }}
          >
            Send tx
          </button>
        )}
      </Actions>
    </div>
  );
};
