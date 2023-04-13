import { useEffect, useMemo, useState } from "react";
import { useDeployedContractInfo, useScaffoldContractRead } from "../../../hooks/scaffold-eth";
import { BigNumber, ethers } from "ethers";
import { useChainId, useSignMessage } from "wagmi";

export type SignedTransaction = {
  contractAddress: string;
  chainId: number;
  functionName?: string;
  hash: any;
  signature: `0x${string}`;
  args: {
    nonce: any;
    to: string | undefined;
    amount: string | BigNumber;
    data: string;
  };
};

export const useCreateSignedTransaction = ({
  to: optionalTo,
  amount: optionalAmount,
  data = "0x",
}: {
  to?: string | undefined;
  amount?: string | BigNumber;
  data?: string;
}) => {
  const [signedTransaction, setSignedTransaction] = useState<SignedTransaction>();
  const chainId = useChainId();
  const { data: contractData } = useDeployedContractInfo("MetaMultiSigWallet");
  const { data: nonce } = useScaffoldContractRead({ contractName: "MetaMultiSigWallet", functionName: "nonce" });

  const to = optionalTo || contractData?.address;
  const amount = optionalAmount || "0";
  const {
    data: transactionHash,
    refetch: getTransactionHash,
    isFetched,
  } = useScaffoldContractRead({
    contractName: "MetaMultiSigWallet",
    functionName: "getTransactionHash",
    args: [nonce, to, amount ? BigNumber.from(amount) : undefined, data as `0x${string}`],
    enabled: false,
  });
  useEffect(() => {
    if (nonce !== undefined && to && amount && data) {
      setSignedTransaction(undefined);
      getTransactionHash();
    }
  }, [amount, data, nonce, getTransactionHash, to]);

  const { data: signature, signMessage } = useSignMessage({
    // newHash is a bytes32 written as a hex string, so we need to convert it back to bytes like
    message: transactionHash ? ethers.utils.arrayify(transactionHash) : undefined,
  });

  const { data: recoveredAddress, refetch: recover } = useScaffoldContractRead({
    contractName: "MetaMultiSigWallet",
    functionName: "recover",
    args: [signedTransaction?.hash, signature],
    enabled: false,
  });
  useEffect(() => {
    if (signedTransaction?.hash && signature) {
      recover();
    }
  }, [recover, signature, signedTransaction]);

  const { data: isOwner } = useScaffoldContractRead({
    contractName: "MetaMultiSigWallet",
    functionName: "isOwner",
    args: [recoveredAddress],
    enabled: !!recoveredAddress,
  });

  return useMemo(
    () => ({
      transaction: isOwner && signature ? ({ ...signedTransaction, signature } as SignedTransaction) : undefined,
      error: isFetched && signature && isOwner === false,
      createSignedTransaction: isFetched
        ? () => {
            setSignedTransaction({
              contractAddress: contractData?.address,
              chainId,
              hash: transactionHash,
              signature,
              args: { nonce, to, amount, data },
            } as SignedTransaction);
            signMessage();
          }
        : () => undefined,
    }),
    [
      amount,
      chainId,
      contractData?.address,
      data,
      isFetched,
      isOwner,
      nonce,
      signMessage,
      signature,
      signedTransaction,
      to,
      transactionHash,
    ],
  );
};
