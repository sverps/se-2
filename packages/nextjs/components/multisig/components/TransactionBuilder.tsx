import { useEffect, useMemo, useState } from "react";
import { Select } from "./Select";
import { BigNumber } from "ethers";
import { useMutation, useQueryClient } from "wagmi";
import { useCalldata } from "~~/components/multisig/hooks/useCalldata";
import { useCreateSignedTransaction } from "~~/components/multisig/hooks/useCreateSignedTransaction";
import { AddressInput } from "~~/components/scaffold-eth/Input/AddressInput";
import { IntegerInput } from "~~/components/scaffold-eth/Input/IntegerInput";

enum Action {
  ADD_SIGNER = "ADD_SIGNER",
  REMOVE_SIGNER = "REMOVE_SIGNER",
  UPDATE_SIGNATURES_REQUIRED = "UPDATE_SIGNATURES_REQUIRED",
  SEND_ETHER = "SEND_ETHER",
}

type Option = { action: Action; functionName?: string; label: string };

const options = [
  { action: Action.ADD_SIGNER, functionName: "addSigner", label: "Add signer" },
  { action: Action.REMOVE_SIGNER, functionName: "removeSigner", label: "Remove signer" },
  {
    action: Action.UPDATE_SIGNATURES_REQUIRED,
    functionName: "updateSignaturesRequired",
    label: "Update required signatures",
  },
  { action: Action.SEND_ETHER, label: "Send ether" },
] as Option[];

export const TransactionBuilder = () => {
  const queryClient = useQueryClient();
  const [option, setOption] = useState<Option>();

  const [signerParam, setSignerParam] = useState("");
  const [signaturesRequired, setSignaturesRequired] = useState<string | BigNumber>("");
  const calldataParams = useMemo(() => {
    if (!option) {
      return [];
    }
    if ([Action.ADD_SIGNER, Action.REMOVE_SIGNER].includes(option.action)) {
      return [signerParam, signaturesRequired];
    }
    if (option.action === Action.UPDATE_SIGNATURES_REQUIRED) {
      return [signaturesRequired];
    }
  }, [option, signaturesRequired, signerParam]);
  const { calldata } = useCalldata(option?.functionName, calldataParams);

  const [amount, setAmount] = useState<string | BigNumber>("");
  const [to, setTo] = useState<string>("");

  const { transaction, error, createSignedTransaction } = useCreateSignedTransaction({
    to,
    amount,
    data: calldata,
  });

  const { mutate } = useMutation({
    mutationFn: async (tx: any) =>
      fetch("http://localhost:49832/", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tx),
      }),
  });
  useEffect(() => {
    if (transaction) {
      const { signature, ...rest } = transaction;
      mutate(
        { ...rest, signatures: [signature], functionName: option?.functionName },
        {
          onSuccess() {
            queryClient.invalidateQueries(["TRANSACTIONS"]);
          },
        },
      );
      setOption(undefined);
      setTo("");
      setAmount("");
      setSignerParam("");
      setSignaturesRequired("");
    }
  }, [mutate, option?.functionName, queryClient, transaction]);

  return (
    <div className="flex flex-col w-full bg-base-100 border-base-300 border shadow-md shadow-secondary rounded-3xl px-6 lg:px-8 py-6 gap-4">
      <Select
        value={option?.label}
        placeholder="Select transaction type"
        onChange={value => {
          setTo("");
          setAmount("");
          setSignerParam("");
          setSignaturesRequired("");
          setOption(options.find(o => o.label === value));
        }}
        options={options.map(o => o.label)}
      />
      {option &&
        [Action.ADD_SIGNER, Action.REMOVE_SIGNER, Action.UPDATE_SIGNATURES_REQUIRED].includes(option.action) && (
          <>
            {option.action !== Action.UPDATE_SIGNATURES_REQUIRED && (
              <div>
                <AddressInput
                  placeholder={option.action === Action.ADD_SIGNER ? "Address to add" : "Address to remove"}
                  value={signerParam}
                  onChange={newAddress => setSignerParam(newAddress)}
                />
              </div>
            )}
            <div>
              <IntegerInput
                placeholder="New number of signatures"
                value={signaturesRequired}
                onChange={value => setSignaturesRequired(value)}
              />
            </div>
          </>
        )}
      {option?.action === Action.SEND_ETHER && (
        <>
          <div>
            <AddressInput
              placeholder="Recipient"
              value={to}
              name="recipient"
              onChange={newAddress => setTo(newAddress)}
            />
          </div>
          <div>
            <IntegerInput
              placeholder="Amount"
              value={amount}
              name="amount"
              onChange={newAmount => setAmount(newAmount)}
            />
          </div>
        </>
      )}
      <div className="flex w-full justify-end">
        <button
          className="btn btn-secondary btn-sm normal-case font-thin bg-base-100"
          onClick={() => createSignedTransaction()}
        >
          Create signed transaction
        </button>
      </div>
      {error && <div>Not the owner</div>}
    </div>
  );
};
