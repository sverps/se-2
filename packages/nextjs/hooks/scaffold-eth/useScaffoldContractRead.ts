import {
  AbiFunctionArguments,
  AbiFunctionReturnType,
  ContractAbi,
  ContractName,
  FunctionNamesWithInputs, // ExtractAbiFunctionsWithoutInputs,
} from "./contract.types";
import { useDeployedContractInfo } from "./useDeployedContractInfo";
import type { ExtractAbiFunctionNames } from "abitype";
import { useContractRead } from "wagmi";
import scaffoldConfig from "~~/scaffold.config";

/**
 * @dev wrapper for wagmi's useContractRead hook which loads in deployed contract contract abi, address automatically
 * @param contractName - deployed contract name
 * @param functionName - name of the function to be called
 * @param argsOrConfig[0] - args to be passed to the function call, or extra wagmi configuration if the function takes no args
 * @param argsOrConfig[1] - when optionalArgsAndConfig[0] is used for args, you can use an additional param for extra wagmi configuration
 */
export function useScaffoldContractRead<
  TContractName extends ContractName,
  TFunctionName extends ExtractAbiFunctionNames<ContractAbi<TContractName>, "pure" | "view">,
>(
  contractName: TContractName,
  functionName: TFunctionName,
  ...argsOrConfig: TFunctionName extends FunctionNamesWithInputs<ContractAbi<TContractName>, "pure" | "view">
    ? // param 3: required args; param 4: optional config
      [AbiFunctionArguments<ContractAbi<TContractName>, TFunctionName>, Partial<Parameters<typeof useContractRead>[0]>?]
    : // param 3: optional config
      [Partial<Parameters<typeof useContractRead>[0]>?]
): Omit<ReturnType<typeof useContractRead>, "data" | "refetch"> & {
  data: AbiFunctionReturnType<ContractAbi, TFunctionName>;
  refetch: (options?: {
    throwOnError: boolean;
    cancelRefetch: boolean;
  }) => Promise<AbiFunctionReturnType<ContractAbi, TFunctionName>>;
} {
  const [argsOrReadConfig, optionalReadConfig] = argsOrConfig;
  let args, readConfig;
  if (Array.isArray(argsOrReadConfig)) {
    args = argsOrReadConfig;
    readConfig = optionalReadConfig;
  } else {
    readConfig = argsOrReadConfig;
  }

  const { data: deployedContract } = useDeployedContractInfo(contractName);

  return useContractRead({
    chainId: scaffoldConfig.targetNetwork.id,
    functionName,
    address: deployedContract?.address,
    abi: deployedContract?.abi,
    watch: true,
    args: args ? args : undefined,
    ...readConfig,
  }) as Omit<ReturnType<typeof useContractRead>, "data" | "refetch"> & {
    data: AbiFunctionReturnType<ContractAbi, TFunctionName>;
    refetch: (options?: {
      throwOnError: boolean;
      cancelRefetch: boolean;
    }) => Promise<AbiFunctionReturnType<ContractAbi, TFunctionName>>;
  };
}
