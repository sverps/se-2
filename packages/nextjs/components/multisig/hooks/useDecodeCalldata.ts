import { useMemo } from "react";
import { useDeployedContractInfo } from "../../../hooks/scaffold-eth";
import { ethers } from "ethers";

export const useDecodeCalldata = ({ functionName, calldata }: { functionName?: string; calldata: string }) => {
  const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo("MultisigWallet");

  const decodedCalldata = useMemo(() => {
    if (!functionName) {
      return undefined;
    }
    const writeFunctionToHash = deployedContractData?.abi.find(i => (i as { name?: string }).name === functionName) as
      | {
          name: string;
        }
      | undefined;
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
