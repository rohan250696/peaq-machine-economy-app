# peaq Machine Economy App

A React Native (Expo) application that showcases peaq's machine economy vision, allowing users to interact with autonomous machines, earn fractional ownership, and receive profit sharing.

## Features

### 🚀 Core Functionality
- **QR Entry**: Scan QR codes to access the PWA or mobile app
- **Social Authentication**: Login with Google, Apple, Twitter via Privy
- **Wallet Connect**: Connect existing wallets for blockchain interactions
- **Machine Selection**: Browse available machines (RoboCafe, Humanoid)
- **Machine Interactions**: Execute actions like getting coffee or t-shirts
- **Payment Flow**: Pay with PEAQ tokens with real-time transaction status
- **Ownership Tokens**: Receive fractional RWA ownership as NFTs
- **Profit Sharing Dashboard**: Track earnings and machine performance

### 🎨 Design System
- **Dark Theme**: Premium dark mode with purple-to-teal gradients
- **Glassmorphism**: Semi-transparent cards with blur effects
- **Modern Animations**: Smooth transitions using Moti and Reanimated
- **Responsive Design**: Works seamlessly on mobile and web
- **Material 3**: Built with modern design principles

### 🔧 Tech Stack
- **Framework**: Expo (React Native + Web/PWA support)
- **UI System**: Tamagui for unified design system
- **Animations**: Moti, React Native Reanimated, Lottie
- **Navigation**: React Navigation v7
- **Authentication**: Privy SDK
- **Charts**: Recharts (web) + React Native SVG Charts (mobile)
- **Styling**: NativeWind for Tailwind-like utilities

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
│   ├── ActionScreen.tsx
│   ├── PaymentFlowScreen.tsx
│   ├── OwnershipScreen.tsx
│   └── DashboardScreen.tsx
├── components/        # Reusable UI components
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
- Wallet Connect integration
- Glassmorphism design with tab selection

### 3. Machine Selection
- Grid of available machines with live revenue updates
- Glassmorphism cards with machine details
- Pull-to-refresh functionality

### 4. Action Screen
- Machine details and available actions
- Animated action buttons with emoji CTAs
- Benefits explanation

### 5. Payment Flow
- Real-time transaction status modal
- Step-by-step payment process
- Transaction hash display with explorer link

### 6. Ownership Screen
- Confetti animation on success
- NFT/RWA ownership display
- Animated percentage counter

### 7. Dashboard
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
PEAQ_CHAIN_ID=your_chain_id

# Email Service (Optional)
SENDGRID_API_KEY=your_sendgrid_key
```

### Tamagui Configuration
The design system is configured in `tamagui.config.ts` with:
- Custom dark theme with peaq brand colors
- Glassmorphism utilities
- Gradient definitions
- Typography scale using Inter font

## Development

### Adding New Machines
1. Update `MOCK_MACHINES` in `src/constants/index.ts`
2. Add machine type to `MACHINE_ACTIONS` if needed
3. Update types in `src/types/index.ts`

### Customizing Animations
- Use Moti for simple animations
- React Native Reanimated for complex gestures
- Lottie for advanced animations

### Styling Guidelines
- Use Tamagui components for consistency
- Apply glassmorphism with `GLASSMORPHISM` constants
- Use gradient backgrounds with `GRADIENTS` constants
- Follow the dark theme color palette

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

## Support

For support and questions:
- Create an issue in the repository
- Join the peaq community Discord
- Check the documentation at docs.peaq.network

---

Built with ❤️ for the peaq machine economy vision
