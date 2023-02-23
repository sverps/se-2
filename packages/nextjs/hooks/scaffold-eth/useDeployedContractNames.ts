import { useEffect, useState } from "react";
import { useProvider } from "wagmi";
import { getTargetNetwork } from "~~/utils/scaffold-eth";

import contracts from "~~/generated/hardhat_contracts.json";

/**
 * @dev use this hook to get the list of contracts deployed by `yarn deploy`.
 * @returns {string[]} array of contract names
 */
export const useDeployedContractNames = () => {
  const configuredChain = getTargetNetwork();
  const [deployedContractNames, setDeployedContractNames] = useState<undefined | string[]>(undefined);
  const provider = useProvider({ chainId: configuredChain.id });

  useEffect(() => {
    if (provider) {
      try {
        const contractsAtChain = contracts[configuredChain.id as unknown as keyof typeof contracts];
        const contractsData = contractsAtChain?.[0]?.contracts;
        if (contractsData) {
          setDeployedContractNames(Object.keys(contractsData));
        }
      } catch (e) {
        // Contract not deployed or file doesn't exist.
        setDeployedContractNames(undefined);
        return;
      }
    }
  }, [configuredChain.id, provider]);

  return deployedContractNames;
};
