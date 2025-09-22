# peaq Machine Economy App

A React Native (Expo) application that showcases peaq's machine economy vision, allowing users to interact with autonomous machines, earn profit-sharing tokens, and participate in the decentralized machine economy.

## 📱 Try the Demo App

Scan the QR code below to try the live demo:

<div align="center">

### 🔗 Demo App QR Code

<!-- QR Code generated for https://dev-peaq-demo-app.cisys.xyz/ -->
![Demo App QR Code](https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https%3A//dev-peaq-demo-app.cisys.xyz/)

**🔗 Demo URL:** [https://dev-peaq-demo-app.cisys.xyz/](https://dev-peaq-demo-app.cisys.xyz/)

*Scan with your phone's camera to open the demo app directly in your browser*

</div>

## Features

### 🚀 Core Functionality
- **Social Authentication**: Login with Google, Apple, Twitter via Privy
- **Wallet Connect**: Connect existing wallets for blockchain interactions
- **Machine Selection**: Browse available machines (RoboCafe, Humanoid) with real-time data
- **Smart Contract Integration**: Direct interaction with MachineManager contract
- **Payment Flow**: Pay with PEAQ tokens with automatic airdrop for new users
- **Profit Sharing Tokens**: Receive peaqPFT tokens representing machine ownership
- **Real-time Balance Tracking**: Monitor PEAQ and peaqPFT token balances
- **Transaction History**: View all transaction hashes and status

### 🎨 Design System
- **Light/Dark Theme**: Dynamic theme switching with peaq brand colors
- **Glassmorphism**: Semi-transparent cards with blur effects
- **Modern Animations**: Smooth transitions using Moti and Reanimated
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- **Material 3**: Built with modern design principles
- **Custom Icons**: PeaqSharingTokenIcon for consistent branding

### 🔧 Tech Stack
- **Framework**: Expo (React Native + Web/PWA support)
- **UI System**: Material 3 + GetWidget components
- **Animations**: Moti, React Native Reanimated, Rive for animated SVGs
- **Navigation**: React Navigation v7
- **Authentication**: Privy SDK
- **Blockchain**: Wagmi v2 for Ethereum/EVM interactions
- **Smart Contracts**: Viem for contract interactions
- **Styling**: Custom responsive utilities with 'Nb International Pro' font

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd peaq-machine-economy-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on specific platforms**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   
   # Web
   npm run web
   ```

## Project Structure

```
src/
├── screens/           # Main app screens
│   ├── SplashScreen.tsx
│   ├── OnboardingScreen.tsx
│   ├── MachineSelectionScreen.tsx
│   ├── PaymentFlowScreen.tsx
│   ├── OwnershipScreen.tsx
│   └── DashboardScreen.tsx
├── components/        # Reusable UI components
│   ├── PeaqSharingTokenIcon.tsx
│   ├── UserInfoHeader.tsx
│   ├── MachineCard.tsx
│   └── ResponsiveContainer.tsx
├── contexts/         # React contexts
│   ├── MachineManagerContext.tsx
│   └── ThemeContext.tsx
├── abi/              # Smart contract ABIs
│   ├── MachineManagerABI.json
│   ├── ERC20.json
│   └── ProfitSharingToken.json
├── types/            # TypeScript type definitions
├── constants/        # App constants and mock data
└── utils/           # Utility functions
```

## Key Screens

### 1. Splash Screen
- Animated peaq logo with gradient background
- Smooth transitions to onboarding

### 2. Onboarding
- Social login options (Google, Apple, Twitter)
- Direct Privy login modal integration
- Modern responsive UI with real social media logos

### 3. Machine Selection
- Grid of available machines with real-time contract data
- Network statistics (total machines, revenue, chain ID)
- Profit Sharing Token balance display
- Responsive container for desktop/laptop centering

### 4. Payment Flow
- Automatic PEAQ token airdrop for new users
- Smart contract interaction with MachineManager
- Real-time transaction status with hashes
- Navigation to ownership details

### 5. Ownership Screen
- Modern responsive UI design
- peaqPFT token balance display with branded icon
- Machine overview and statistics
- Back navigation to machine selection

### 6. Dashboard
- Portfolio overview with animated balance
- Earnings charts and statistics
- Machine ownership list with live updates

## Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
# Privy Configuration
PRIVY_APP_ID=your_privy_app_id
PRIVY_APP_SECRET=your_privy_app_secret

# Blockchain Configuration
PEAQ_RPC_URL=your_peaq_rpc_url
PEAQ_CHAIN_ID=3338  # or 9990 (both supported)

# Smart Contract Addresses
MACHINE_MANAGER_ADDRESS=0x6B199Bf7b3bFB7687485E0972228415B4Aa3408c
PROFIT_SHARING_TOKEN_ADDRESS=0x...

# Airdrop Configuration
AIRDROP_PRIVATE_KEY=your_airdrop_private_key
GAS_FEE_ESTIMATE=0.001
```

### Smart Contract Integration
The app integrates with:
- **MachineManager Contract**: Handles machine interactions and payments
- **ProfitSharingToken Contract**: Manages peaqPFT token distribution
- **ERC20 PEAQ Token**: For payments and airdrops
- **Multi-chain Support**: Supports chain IDs 3338 and 9990

## Development

### Smart Contract Integration
1. Update contract addresses in `src/contexts/MachineManagerContext.tsx`
2. Modify ABI files in `src/abi/` directory
3. Update TypeScript types in `src/types/MachineManagerTypes.ts`

### Adding New Components
1. Create components in `src/components/` directory
2. Use `ResponsiveContainer` for desktop/laptop centering
3. Follow the theme system with `useTheme` hook
4. Use `PeaqSharingTokenIcon` for consistent branding

### Customizing Animations
- Use Moti for simple animations
- React Native Reanimated for complex gestures
- Rive for animated SVGs

### Styling Guidelines
- Use Material 3 + GetWidget components
- Apply glassmorphism with `GLASSMORPHISM` constants
- Use gradient backgrounds with `GRADIENTS` constants
- Follow the dynamic theme system (light/dark)
- Use 'Nb International Pro' font family
- Implement responsive design with custom utilities

## Current Features

### 🔗 Smart Contract Integration
- **MachineManager Contract**: Direct interaction with deployed contract
- **Real-time Data**: Live machine data, balances, and transaction status
- **Multi-chain Support**: Works with Peaq network (chain IDs 3338 and 9990)
- **Airdrop System**: Automatic PEAQ token distribution for new users

### 💰 Token Management
- **PEAQ Token**: Native and ERC20 token support
- **peaqPFT Tokens**: Profit-sharing tokens with branded icons
- **Balance Tracking**: Real-time balance updates across all token types
- **Transaction History**: Complete transaction hash tracking

### 🎨 UI/UX Features
- **Responsive Design**: Mobile, tablet, and desktop optimization
- **Theme System**: Dynamic light/dark theme switching
- **Branded Icons**: Consistent peaq logo usage throughout
- **Modern Animations**: Smooth transitions and micro-interactions

### 🔐 Authentication & Security
- **Privy Integration**: Social login with Google, Apple, Twitter
- **Wallet Connect**: Support for existing wallet connections
- **Secure Transactions**: Proper error handling and validation

## Building for Production

### Web (PWA)
```bash
npx expo export:web
```

### Mobile Apps
```bash
# Build for iOS
npx eas build --platform ios

# Build for Android
npx eas build --platform android
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on multiple platforms
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## KBW Demo

Scan the QR code below to access the KBW demo:

![KBW Demo QR Code](https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https%3A//kbw.peaq.xyz/)

**Direct Link:** [https://kbw.peaq.xyz/](https://kbw.peaq.xyz/)

*Scan with your mobile device to quickly access the KBW demo application.*

> **Note:** A local SVG version of this QR code is also available in `/assets/kbw-demo-qr-code.svg`

## Support

For support and questions:
- Create an issue in the repository
- Join the peaq community Discord
- Check the documentation at docs.peaq.network

---

Built with ❤️ for the peaq machine economy vision
