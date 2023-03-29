import { useEffect } from "react";
import { SignedTransaction, useCreateSignedTransaction } from "../hooks/useCreateSignedTransaction";
import { BigNumber } from "ethers";
import { useMutation, useQueryClient } from "wagmi";
import { useDeployedContractInfo, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { stringifySignedTransaction } from "./utils";
import { Actions } from "./Actions";

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
  const queryClient = useQueryClient();
  const { data: contractData } = useDeployedContractInfo("MetaMultiSigWallet");
  const { write: submitTransaction } = useScaffoldContractWrite({
    contractName: "MetaMultiSigWallet",
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
      return fetch("http://localhost:49832/", {
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
    <div>
      <div>{transaction.args.nonce.toString()}</div>
      <div>{transaction.functionName}</div>
      <div>{`(${transaction.signatures?.length} / ${signaturesRequired})`}</div>
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
            disabled={transaction.signatures.length >= signaturesRequired}
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
