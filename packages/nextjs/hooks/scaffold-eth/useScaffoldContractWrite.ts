import { useState } from "react";
import { AbiFunctionArguments, ContractAbi, ContractName, FunctionNamesWithInputs } from "./contract.types";
import { Abi, ExtractAbiFunctionNames } from "abitype";
import { utils } from "ethers";
import { useContractWrite, useNetwork } from "wagmi";
import { getParsedEthersError } from "~~/components/scaffold-eth";
import { useDeployedContractInfo, useTransactor } from "~~/hooks/scaffold-eth";
import scaffoldConfig from "~~/scaffold.config";
import { notification } from "~~/utils/scaffold-eth";

/**
 * @dev wrapper for wagmi's useContractWrite hook(with config prepared by usePrepareContractWrite hook) which loads in deployed contract abi and address automatically
 * @param contractName - deployed contract name
 * @param functionName - name of the function to be called
 * @param argsOrValueOrConfig[0] - args to be passed to the function call, or extra wagmi configuration if the function takes no args
 * @param argsOrValueOrConfig[1] - when optionalArgsAndConfig[0] is used for args, you can use an additional param for extra wagmi configuration
 */
export const useScaffoldContractWrite = <
  TContractName extends ContractName,
  TFunctionName extends ExtractAbiFunctionNames<ContractAbi<TContractName>, "payable" | "nonpayable">,
>(
  contractName: TContractName,
  functionName: TFunctionName,
  {
    args,
    value,
    ...writeConfig
  }: TFunctionName extends FunctionNamesWithInputs<ContractAbi<TContractName>, "payable" | "nonpayable">
    ? {
        args: AbiFunctionArguments<ContractAbi<TContractName>, TFunctionName>;
        value?: string;
      } & Partial<
        Omit<
          Extract<Parameters<typeof useContractWrite>[0], { mode: "recklesslyUnprepared" }>,
          "abi" | "functionName" | "args"
        >
      >
    : {
        args?: never;
        value?: string;
      } & Partial<
        Omit<
          Extract<Parameters<typeof useContractWrite>[0], { mode: "recklesslyUnprepared" }>,
          "abi" | "functionName" | "args"
        >
      >,
) => {
  const { data: deployedContractData } = useDeployedContractInfo(contractName);
  const { chain } = useNetwork();
  const writeTx = useTransactor();
  const [isMining, setIsMining] = useState(false);
  const configuredNetwork = scaffoldConfig.targetNetwork;

  const wagmiContractWrite = useContractWrite({
    mode: "recklesslyUnprepared",
    chainId: configuredNetwork.id,
    address: deployedContractData?.address,
    abi: deployedContractData?.abi as Abi,
    args: args as unknown[],
    functionName: functionName as any,
    overrides: {
      value: value ? utils.parseEther(value) : undefined,
    },
    ...writeConfig,
  });

  const sendContractWriteTx = async () => {
    if (!deployedContractData) {
      notification.error("Target Contract is not deployed, did you forgot to run `yarn deploy`?");
      return;
    }
    if (!chain?.id) {
      notification.error("Please connect your wallet");
      return;
    }
    if (chain?.id !== configuredNetwork.id) {
      notification.error("You on the wrong network");
      return;
    }

    if (wagmiContractWrite.writeAsync) {
      try {
        setIsMining(true);
        await writeTx(wagmiContractWrite.writeAsync());
      } catch (e: any) {
        const message = getParsedEthersError(e);
        notification.error(message);
      } finally {
        setIsMining(false);
      }
    } else {
      notification.error("Contract writer error. Try again.");
      return;
    }
  };

  return {
    ...wagmiContractWrite,
    isMining,
    // Overwrite wagmi's write async
    writeAsync: sendContractWriteTx,
  };
};
