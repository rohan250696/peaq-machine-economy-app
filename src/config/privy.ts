import { PrivyProvider } from '@privy-io/react-auth'
import { peaqChain, supportedChains, defaultChain } from './chains'

export const privyConfig = {
  appId: process.env.EXPO_PUBLIC_PRIVY_APP_ID || 'cmfbnnxj1002qjv0bvwv55syr',
  config: {
    // Login methods
    loginMethods: ['google', 'apple', 'twitter'] as Array<'google' | 'apple' | 'twitter'>,
    
    // Blockchain configuration
    defaultChain: defaultChain,
    supportedChains: supportedChains,
    
    // Appearance
    appearance: {
      theme: 'dark' as const,
      accentColor: '#5252D7' as const,
      logo: 'https://your-logo-url.com/logo.png',
    },
    
    // Embedded wallets
    embeddedWallets: {
      createOnLogin: 'users-without-wallets' as const,
      requireUserPasswordOnCreate: false,
      noPromptOnSignature: false,
    },
    
    // Legal
    legal: {
      termsAndConditionsUrl: 'https://your-terms-url.com',
      privacyPolicyUrl: 'https://your-privacy-url.com',
    },
  },
}

export default privyConfig
