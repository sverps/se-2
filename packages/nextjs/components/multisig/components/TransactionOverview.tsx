import { Pane } from "./Pane";
import { StoredTransaction, Transaction } from "./Transaction";
import { BigNumber } from "ethers";
import { useChainId, useQuery } from "wagmi";
import { useDeployedContractInfo, useScaffoldContractRead } from "~~/hooks/scaffold-eth";

export const TransactionOverview = () => {
  const chainId = useChainId();
  const { data: contractData } = useDeployedContractInfo("MultisigWallet");
  const { data: signaturesRequired } = useScaffoldContractRead({
    contractName: "MultisigWallet",
    functionName: "signaturesRequired",
  });
  const { data: nonce } = useScaffoldContractRead({
    contractName: "MultisigWallet",
    functionName: "nonce",
  });

  const { data: transactions } = useQuery(
    ["TRANSACTIONS", contractData, nonce],
    async () => {
      if (!contractData?.address) {
        return [];
      }
      try {
        const response = await fetch(`/api/storage/${contractData.address}_${chainId}`);
        const data = await response.json();
        return (Object.entries(data) as [string, StoredTransaction][])
          .filter(([, tx]) => nonce?.toString() === tx.args.nonce.toString())
          .map(([hash, tx]) => [
            hash,
            {
              ...tx,
              args: { ...tx.args, nonce: BigNumber.from(tx.args.nonce), amount: BigNumber.from(tx.args.amount) },
            },
          ]) as [string, StoredTransaction][];
      } catch {
        return [];
      }
    },
    { enabled: nonce !== undefined },
  );

  if (signaturesRequired === undefined) {
    return null;
  }

  return (
    <Pane title="Transaction overview" className="min-h-[10rem] divide-y divide-base-300">
      {transactions?.length
        ? transactions.map(([hash, transaction]) => (
            <Transaction
              key={hash}
              transaction={transaction as StoredTransaction}
              signaturesRequired={signaturesRequired.toNumber()}
            />
          ))
        : "No valid pending transactions. You can create a new transaction in the pane above."}
    </Pane>
  );
};
