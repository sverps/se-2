import { ethers } from "ethers";
import { useMemo } from "react";
import { useDeployedContractInfo } from "../../../hooks/scaffold-eth";

export const useCalldata = (functionName?: string, args?: any[]) => {
  const { data: deployedContractData, isLoading: deployedContractLoading } =
    useDeployedContractInfo("MetaMultiSigWallet");

  const calldata = useMemo(() => {
    const writeFunctionToHash = deployedContractData?.abi.find(i => i.name === functionName);
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
