import type { NextPage } from "next";
import { Page } from "~~/components/multisig/components/Page";
import { TransactionBuilder } from "~~/components/multisig/components/TransactionBuilder";
import { TransactionOverview } from "~~/components/multisig/components/TransactionOverview";

const Multisig: NextPage = () => {
  return (
    <Page>
      <TransactionBuilder />
      <TransactionOverview />
    </Page>
  );
};

export default Multisig;
