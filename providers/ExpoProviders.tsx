import React, { ReactNode } from 'react';
import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider } from '@privy-io/wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from '../lib/config';
// Polyfills are now handled in polyfills.ts

const queryClient = new QueryClient();

interface ExpoProvidersProps {
  children: ReactNode;
}

export default function ExpoProviders({ children }: ExpoProvidersProps) {
  return (
    <PrivyProvider
      appId="cmfbnnxj1002qjv0bvwv55syr"
      config={{
        loginMethods: ['email', 'google', 'twitter', 'apple'],
        embeddedWallets: { createOnLogin: 'users-without-wallets' },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
