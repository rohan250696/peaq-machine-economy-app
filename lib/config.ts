// lib/config.ts
import { createConfig } from "@privy-io/wagmi";
import { http } from "viem";
import { agungTestnet, peaq } from "viem/chains";
import { env, logEnvStatus } from "../src/config/env";

// Initialize environment configuration
logEnvStatus();

// Peaq Chain definition (shared)
export const peaqChain = {
  id: 3338,
  name: "PEAQ Network",
  network: "peaq",
  nativeCurrency: { decimals: 18, name: "PEAQ", symbol: "PEAQ" },
  rpcUrls: { default: { http: ["https://peaq.api.onfinality.io/public"] } },
  blockExplorers: {
    default: { name: "PEAQ Explorer", url: "https://explorer.peaq.network" },
  },
} as const;

// Wagmi config (shared)
export const wagmiConfig = createConfig({
  chains: [agungTestnet, peaq],
  transports: {
    [agungTestnet.id]: http(agungTestnet.rpcUrls.default.http[0]),
    [peaq.id]: http(peaq.rpcUrls.default.http[0]),
  },
});

// Export environment configuration for easy access
export { env } from "../src/config/env";
