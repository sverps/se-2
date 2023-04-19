import { useMemo } from "react";
import { useDeployedContractInfo } from "../../../hooks/scaffold-eth";
import { ethers } from "ethers";

export const useCalldata = (functionName?: string, args?: any[]) => {
  const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo("MultisigWallet");

  const calldata = useMemo(() => {
    type DeployedCOntract = Exclude<typeof deployedContractData, undefined>["abi"];
    type NamedFunction = Extract<DeployedCOntract[number], { readonly anonymous: false }>;

    const writeFunctionToHash = deployedContractData?.abi.find(
      i => (i as NamedFunction).name === functionName,
    ) as NamedFunction;
    if (writeFunctionToHash) {
      try {
        const writeInterface = new ethers.utils.Interface([writeFunctionToHash]);
        return writeInterface.encodeFunctionData(`${writeFunctionToHash.name}`, args);
      } catch {}
    }
    return undefined;
  }, [args, deployedContractData?.abi, functionName]);

  return { calldata, loading: deployedContractLoading };
};
