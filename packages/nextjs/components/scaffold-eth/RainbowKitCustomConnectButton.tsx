import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { TAutoConnect, useAutoConnect } from "~~/hooks/scaffold-eth";
import Balance from "~~/components/scaffold-eth/Balance";
import { useSwitchNetwork } from "wagmi";
import { BlockieAvatar } from "~~/components/scaffold-eth";
import { getTargetNetwork } from "~~/utils/scaffold-eth";

// todo: move this later scaffold config.  See TAutoConnect for comments on each prop
const tempAutoConnectConfig: TAutoConnect = {
  enableBurnerWallet: true,
  autoConnect: true,
};

/**
 * Custom Wagmi Connect Button (watch balance + custom design)
 */
export default function RainbowKitCustomConnectButton() {
  useAutoConnect(tempAutoConnectConfig);
  const { switchNetwork } = useSwitchNetwork();

  const configuredChain = getTargetNetwork();

  const onSwitchNetwork = () => {
    switchNetwork?.(configuredChain.id);
  };

  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <>
            {(() => {
              if (!connected) {
                return (
                  <button className="btn btn-primary btn-sm" onClick={openConnectModal} type="button">
                    Connect Wallet
                  </button>
                );
              }

              if (chain.unsupported || chain.id !== configuredChain.id) {
                return (
                  <div className="rounded-md shadow-lg p-2">
                    <span className="text-error mr-2">Wrong network selected - ({chain.name})</span>
                    <span className="text-primary mr-2">Switch network to</span>
                    <button className="btn btn-xs btn-primary btn-outline" onClick={onSwitchNetwork}>
                      {configuredChain.name}
                    </button>
                  </div>
                );
              }

              return (
                <div className="px-2 flex justify-end items-center">
                  <button
                    onClick={openChainModal}
                    className="btn btn-secondary btn-sm font-normal mr-2 sm:mr-0"
                    type="button"
                  >
                    {chain.hasIcon && (
                      <div className="mt-1">
                        {chain.iconUrl && (
                          <Image alt={chain.name ?? "Chain icon"} src={chain.iconUrl} width="20" height="20" />
                        )}
                      </div>
                    )}
                    <span className="m-2 hidden sm:inline">{chain.name}</span>
                    <span>
                      <ChevronDownIcon className="h-6 w-4 ml-2 sm:ml-0" />
                    </span>
                  </button>

                  <div className="flex justify-center items-center border-1 rounded-lg">
                    <div className="hidden sm:inline-block">
                      <Balance address={account.address} />
                    </div>
                    <button onClick={openAccountModal} type="button" className="btn btn-primary btn-sm pl-2 shadow-md">
                      <BlockieAvatar address={account.address} size={24} ensImage={account.ensAvatar} />
                      <span className="m-1">{account.displayName}</span>
                      <span>
                        <ChevronDownIcon className="h-6 w-4" />
                      </span>
                    </button>
                  </div>
                </div>
              );
            })()}
          </>
        );
      }}
    </ConnectButton.Custom>
  );
}
