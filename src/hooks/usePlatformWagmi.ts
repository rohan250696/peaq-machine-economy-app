import { useAccount as wagmiUseAccount, useChainId as wagmiUseChainId, useSwitchChain as wagmiUseSwitchChain, useBalance as wagmiUseBalance } from "wagmi"

// Safe wrapper hooks with fallbacks
export const useAccount = () => {
  try {
    const result = wagmiUseAccount();
    return result || { address: undefined, isConnected: false };
  } catch (error) {
    console.warn('useAccount error:', error);
    return { address: undefined, isConnected: false };
  }
};

export const useChainId = () => {
  try {
    const result = wagmiUseChainId();
    return result || 1; // Default to mainnet
  } catch (error) {
    console.warn('useChainId error:', error);
    return 1; // Default to mainnet
  }
};

export const useSwitchChain = () => {
  try {
    const result = wagmiUseSwitchChain();
    return result || { switchChain: () => Promise.resolve() };
  } catch (error) {
    console.warn('useSwitchChain error:', error);
    return { switchChain: () => Promise.resolve() };
  }
};

export const useBalance = (config: any) => {
  try {
    const result = wagmiUseBalance(config);
    return result || { data: undefined, isLoading: false, error: null };
  } catch (error) {
    console.warn('useBalance error:', error);
    return { data: undefined, isLoading: false, error: null };
  }
};
