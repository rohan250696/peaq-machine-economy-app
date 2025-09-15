"use client";
import React, { ReactNode } from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider } from "@privy-io/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { peaqChain, wagmiConfig } from "../lib/config";
import { Buffer } from "buffer";
import processPolyfill from "process";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "fast-text-encoding";
import "react-native-url-polyfill/auto";
import "react-native-get-random-values";
import { peaq, agungTestnet } from "viem/chains";

// Polyfills for React Native
(global as any).Buffer = (global as any).Buffer || Buffer;
(global as any).process = (global as any).process || processPolyfill;
(global as any).AsyncStorage = (global as any).AsyncStorage || AsyncStorage;

const queryClient = new QueryClient();

interface WebProvidersProps {
  children: ReactNode;
}

export default function WebProviders({ children }: WebProvidersProps) {
  console.log("WebProviders");
  return (
    <PrivyProvider
      appId="cmfbnnxj1002qjv0bvwv55syr"
      config={{
        loginMethods: ["google", "twitter"],
        embeddedWallets: { createOnLogin: "users-without-wallets" },
        defaultChain: agungTestnet,
        supportedChains: [peaq, agungTestnet],
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
