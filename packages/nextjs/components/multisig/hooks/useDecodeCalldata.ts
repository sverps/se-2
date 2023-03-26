import { ethers } from "ethers";
import { useMemo } from "react";
import { useDeployedContractInfo } from "../../../hooks/scaffold-eth";

export const useDecodeCalldata = (functionName: string, calldata: string) => {
  const { data: deployedContractData, isLoading: deployedContractLoading } =
    useDeployedContractInfo("MetaMultiSigWallet");

  const decodedCalldata = useMemo(() => {
    const writeFunctionToHash = deployedContractData?.abi.find(i => i.name === functionName);
    if (writeFunctionToHash) {
      try {
        const writeInterface = new ethers.utils.Interface([writeFunctionToHash]);
        return writeInterface.decodeFunctionData(`${writeFunctionToHash.name}`, calldata);
      } catch {}
    }
    return undefined;
  }, [calldata, deployedContractData?.abi, functionName]);

  return { decodedCalldata, loading: deployedContractLoading };
};
