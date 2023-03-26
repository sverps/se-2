import { useEffect } from "react";
import { SignedTransaction, useCreateSignedTransaction } from "../hooks/useCreateSignedTransaction";
import { BigNumber } from "ethers";
import { useMutation, useQueryClient } from "wagmi";
import { useDeployedContractInfo, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

export type StoredTransaction = {
  contractAddress: string | undefined;
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
        body: JSON.stringify({ ...transaction, signatures: [...transaction.signatures, newTx.signature] }),
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
      <button
        className="btn btn-secondary btn-sm normal-case font-thin bg-base-100"
        onClick={() => {
          signTransaction();
        }}
      >
        Sign transaction
      </button>
      {submitTransaction && (
        <button
          className="btn btn-secondary btn-sm normal-case font-thin bg-base-100"
          onClick={() => {
            submitTransaction();
          }}
        >
          Send transaction
        </button>
      )}
    </div>
  );
};
