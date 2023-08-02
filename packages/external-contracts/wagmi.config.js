// @ts-check
import { etherscan } from "@wagmi/cli/plugins";
import "dotenv/config";

/** @type {import('@wagmi/cli').Config} */
export default {
  out: "out/generated.js",
  contracts: [],
  plugins: [
    etherscan({
      apiKey: process.env.ETHERSCAN_API_KEY ?? "",
      chainId: 1,
      contracts: [
        {
          name: "testName",
          address: "0x6b175474e89094c44da98b954eedeac495271d0f",
        },
        {
          name: "Dai",
          address: "0x6b175474e89094c44da98b954eedeac495271d0f",
        },
      ],
    }),
  ],
};
