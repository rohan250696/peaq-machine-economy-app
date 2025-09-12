# Privy Dashboard Configuration for Peaq Network

## 🚨 **CRITICAL: Dashboard Configuration Required**

The error `"The configured chains are not supported by Coinbase Smart Wallet: 3338"` indicates that **Coinbase Smart Wallet is still enabled in your Privy dashboard**, even though we've disabled it in code.

## Required Dashboard Changes

### 1. Access Privy Dashboard
- Go to [https://dashboard.privy.io](https://dashboard.privy.io)
- Sign in with your account
- Select your app: `cmfbnnxj1002qjv0bvwv55syr`

### 2. Disable Coinbase Smart Wallet in Dashboard

**Navigate to: Settings → Wallets**

**Disable these options:**
- ❌ **Coinbase Smart Wallet** - Turn OFF
- ❌ **WalletConnect** - Turn OFF  
- ❌ **MetaMask** - Turn OFF
- ❌ **Rainbow** - Turn OFF
- ❌ **Trust Wallet** - Turn OFF
- ❌ **Zerion** - Turn OFF

**Enable only:**
- ✅ **Embedded Wallets** - Turn ON
- ✅ **Create on Login** - Set to "All Users"

### 3. Configure Login Methods

**Navigate to: Settings → Login Methods**

**Enable only:**
- ✅ **Google** - Turn ON
- ✅ **Apple** - Turn ON  
- ✅ **Twitter** - Turn ON

**Disable:**
- ❌ **Wallet Connection** - Turn OFF
- ❌ **Email** - Turn OFF (optional)
- ❌ **Phone** - Turn OFF (optional)

### 4. Configure Custom Chains

**Navigate to: Settings → Chains**

**Add Peaq Network:**
- **Chain ID:** `3338`
- **Name:** `peaq`
- **RPC URL:** `https://peaq.api.onfinality.io/public`
- **Block Explorer:** `https://peaq.subscan.io`
- **Currency:** `PEAQ`
- **Decimals:** `18`
- **Testnet:** No

### 5. Configure Allowed Origins

**Navigate to: Settings → Allowed Origins**

**Add these origins:**
```
http://localhost:8081
http://172.23.232.68:8081
exp://172.23.232.68:8081
```

### 6. Save Configuration

**Important:** After making changes, click **"Save"** or **"Update"** to apply the configuration.

## Why This Happens

The Privy dashboard configuration **overrides** the code configuration. Even if we set `coinbaseWallet: false` in code, if it's enabled in the dashboard, Privy will still try to initialize it.

## Verification Steps

After updating the dashboard:

1. **Clear browser cache** and restart the development server
2. **Test login** - Should not show Coinbase Smart Wallet error
3. **Check console** - Should show embedded wallet creation
4. **Verify network** - Should connect to Peaq (Chain ID: 3338)

## Alternative: Use Different App ID

If you can't modify the dashboard settings, you can:

1. **Create a new Privy app** in the dashboard
2. **Configure it properly** from the start (embedded wallets only)
3. **Update the App ID** in your code

## Current Code Configuration

Your code is correctly configured:

```typescript
config: {
  loginMethods: ['google', 'apple', 'twitter'],
  embeddedWallets: { createOnLogin: 'all' },
  walletConnect: false,
  coinbaseWallet: false,
  externalWallets: {
    coinbaseWallet: false,
    walletConnect: false,
    // ... all disabled
  }
}
```

The issue is in the **dashboard configuration**, not the code.
