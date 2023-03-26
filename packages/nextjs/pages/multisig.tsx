import type { NextPage } from "next";
import { TransactionBuilder } from "~~/components/multisig/components/TransactionBuilder";
import { TransactionOverview } from "~~/components/multisig/components/TransactionOverview";

const Multisig: NextPage = () => {
  return (
    <div className="flex flex-col self-center w-full max-w-3xl py-8 gap-6">
      <TransactionBuilder />
      <TransactionOverview />
    </div>
  );
};

export default Multisig;
