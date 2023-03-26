import { StoredTransaction, Transaction } from "./Transaction";
import { BigNumber } from "ethers";
import { useChainId, useQuery } from "wagmi";
import { useDeployedContractInfo, useScaffoldContractRead } from "~~/hooks/scaffold-eth";

export const TransactionOverview = () => {
  const chainId = useChainId();
  const { data: contractData } = useDeployedContractInfo("MetaMultiSigWallet");
  const { data: signaturesRequired } = useScaffoldContractRead({
    contractName: "MetaMultiSigWallet",
    functionName: "signaturesRequired",
  });
  // const { data: nonce } = useScaffoldContractRead({
  //   contractName: "MetaMultiSigWallet",
  //   functionName: "nonce",
  // });

  const { data: transactions } = useQuery(["TRANSACTIONS", contractData], async () => {
    if (!contractData?.address) {
      return [];
    }
    try {
      const response = await fetch(`http://localhost:49832/${contractData.address}_${chainId}`);
      const data = await response.json();
      return (Object.entries(data) as [string, StoredTransaction][]).map(([hash, tx]) => [
        hash,
        { ...tx, args: { ...tx.args, nonce: BigNumber.from(tx.args.nonce), amount: BigNumber.from(tx.args.amount) } },
      ]) as [string, StoredTransaction][];
    } catch {
      return [];
    }
  });

  if (signaturesRequired === undefined) {
    return null;
  }

  return (
    <div className="flex justify-center">
      <div className="bg-base-100 border-base-300 border shadow-md shadow-secondary rounded-3xl px-6 lg:px-8 mb-6 space-y-1 py-4">
        {transactions?.map(([hash, transaction]) => (
          <Transaction
            key={hash}
            transaction={transaction as StoredTransaction}
            signaturesRequired={signaturesRequired.toNumber()}
          />
        ))}
      </div>
    </div>
  );
};
