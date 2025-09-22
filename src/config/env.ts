import Constants from 'expo-constants';
import { KBW_APP_WALLET_KEY } from '@env';

/**
 * Environment configuration for the app
 * Uses react-native-dotenv for simple .env file support
 */

// Get environment variable from multiple sources
const getKbwKey = () => {
  // Try to import backup constants file (created during build)
  let injectedEnv;
  try {
    injectedEnv = require('./injected-env').INJECTED_ENV;
  } catch (error) {
    // File doesn't exist, that's okay
    injectedEnv = null;
  }
  
  // Debug all sources
  const sources = {
    dotenv: KBW_APP_WALLET_KEY ? KBW_APP_WALLET_KEY.slice(0, 10) + '...' : 'undefined', // From @env (react-native-dotenv)
    processEnv: typeof process !== 'undefined' ? process.env?.KBW_APP_WALLET_KEY : undefined,
    expoConfig: Constants.expoConfig?.extra?.kbwAppWalletKey ? Constants.expoConfig.extra.kbwAppWalletKey.slice(0, 10) + '...' : undefined,
    manifest: (Constants.manifest as any)?.extra?.kbwAppWalletKey,
    injectedFile: injectedEnv?.KBW_APP_WALLET_KEY,
  };
  
  if (__DEV__) {
    console.log('🔍 Environment Sources Debug:', sources);
  }
  
  // Priority order: dotenv > expoConfig > manifest > injected file
  if (KBW_APP_WALLET_KEY && KBW_APP_WALLET_KEY !== '') {
    console.log('✅ Using @env (react-native-dotenv)');
    return KBW_APP_WALLET_KEY;
  }
  
  if (Constants.expoConfig?.extra?.kbwAppWalletKey) {
    console.log('✅ Using Constants.expoConfig.extra.kbwAppWalletKey');
    return Constants.expoConfig.extra.kbwAppWalletKey;
  }
  
  if ((Constants.manifest as any)?.extra?.kbwAppWalletKey) {
    console.log('✅ Using Constants.manifest.extra.kbwAppWalletKey');
    return (Constants.manifest as any).extra.kbwAppWalletKey;
  }
  
  if (injectedEnv?.KBW_APP_WALLET_KEY) {
    console.log('✅ Using injected constants file');
    return injectedEnv.KBW_APP_WALLET_KEY;
  }
  
  console.warn('❌ No KBW_APP_WALLET_KEY found in any source');
  return '';
};

const rawKbwKey = getKbwKey();

// Debug logging in development
if (__DEV__) {
  console.log('🔑 KBW Key Debug:', {
    source: typeof process !== 'undefined' && process.env?.KBW_APP_WALLET_KEY ? 'process.env' : 'expo-constants',
    hasProcessEnv: typeof process !== 'undefined' && !!process.env?.KBW_APP_WALLET_KEY,
    hasExpoConfig: !!Constants.expoConfig?.extra?.kbwAppWalletKey,
    raw: rawKbwKey ? rawKbwKey.slice(0, 10) + '...' : 'empty',
    isTemplate: rawKbwKey.includes('${'),
    length: rawKbwKey.length,
    startsWithHex: rawKbwKey.startsWith('0x') || rawKbwKey.startsWith('3d'),
  });
}

export const env = {
  /**
   * KBW App Wallet Key
   * Used for KBW (Korea Blockchain Week) app wallet integration
   * SECURITY: Loaded from secure environment variables
   * - React Native Web: process.env.KBW_APP_WALLET_KEY (via webpack)
   * - Expo Native: Constants.expoConfig.extra.kbwAppWalletKey
   */
  KBW_APP_WALLET_KEY: rawKbwKey.includes('${') ? '' : rawKbwKey, // Don't use template strings
};

// Additional debug logging for production
console.log('🔑 Final Environment Configuration:');
console.log('  KBW_APP_WALLET_KEY available:', !!env.KBW_APP_WALLET_KEY);
console.log('  Key length:', env.KBW_APP_WALLET_KEY?.length || 0);
console.log('  Key preview:', env.KBW_APP_WALLET_KEY ? env.KBW_APP_WALLET_KEY.slice(0, 8) + '...' : 'N/A');

/**
 * Validates that all required environment variables are present
 * @returns {boolean} true if all required vars are present, false otherwise
 */
export const validateEnv = (): boolean => {
  const requiredVars = ['KBW_APP_WALLET_KEY'];
  
  for (const varName of requiredVars) {
    if (!env[varName as keyof typeof env]) {
      console.warn(`⚠️ Missing required environment variable: ${varName}`);
      return false;
    }
  }
  
  return true;
};

/**
 * Logs environment configuration status (for debugging)
 * Only logs in development mode
 */
export const logEnvStatus = (): void => {
  if (__DEV__) {
    console.log('🔧 Environment Configuration:');
    if (!validateEnv()) {
      console.warn('⚠️ Some environment variables are missing. Check your .env file.');
    } else {
      console.log('✅ All required environment variables are configured.');
    }
  }
};
