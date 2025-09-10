import { defineChain } from 'viem'

// Peaq Chain Configuration
// Based on Peaq Subscan: https://peaq.subscan.io
// Chain ID: 3338 (Polkadot Para ID)
export const peaqChain = defineChain({
  id: 3338, // Peaq's chain ID
  name: 'peaq',
  network: 'peaq',
  nativeCurrency: {
    decimals: 18,
    name: 'peaq',
    symbol: 'PEAQ',
  },
  rpcUrls: {
    default: {
      http: ['https://peaq.api.onfinality.io/public'],
    },
    public: {
      http: ['https://peaq.api.onfinality.io/public'],
    },
  },
  blockExplorers: {
    default: { 
      name: 'peaq Subscan', 
      url: 'https://peaq.subscan.io' 
    },
    subscan: { 
      name: 'peaq Subscan', 
      url: 'https://peaq.subscan.io' 
    },
  },
  testnet: false,
})

// Export all supported chains
export const supportedChains = [peaqChain]

// Default chain for the application
export const defaultChain = peaqChain
