// lib/config.ts
import { createConfig } from '@privy-io/wagmi';
import { http } from 'viem';
import { agungTestnet, peaq } from 'viem/chains';

// Peaq Chain definition (shared)
export const peaqChain = {
  id: 3338,
  name: 'PEAQ Network',
  network: 'peaq',
  nativeCurrency: { decimals: 18, name: 'PEAQ', symbol: 'PEAQ' },
  rpcUrls: { default: { http: ['https://peaq.api.onfinality.io/public'] } },
  blockExplorers: { default: { name: 'PEAQ Explorer', url: 'https://explorer.peaq.network' } },
} as const;

// Wagmi config (shared)
export const wagmiConfig = createConfig({
  chains: [peaqChain, agungTestnet],
  transports: { [peaqChain.id]: http(peaqChain.rpcUrls.default.http[0]), 
    [agungTestnet.id]: http(agungTestnet.rpcUrls.default.http[0]) }
});
