// Polyfills are now loaded in index.js before this file

import React, { useEffect } from 'react'
import { View, Text, Platform } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { TamaguiProvider } from '@tamagui/core'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import PlatformProviders from './src/components/PlatformProviders'
import GlobalUserInfo from './src/components/GlobalUserInfo'
import { ThemeProvider } from './src/contexts/ThemeContext'
import { MachineManagerProvider } from './src/contexts/MachineManagerContext'

import tamaguiConfig from './tamagui.config'
import { useFonts } from 'expo-font'

// Import screens - adding back one by one to identify Buffer issue
import SplashScreen from './src/screens/SplashScreen'
import OnboardingScreen from './src/screens/OnboardingScreen'
import MachineSelectionScreen from './src/screens/MachineSelectionScreen'
import DashboardScreen from './src/screens/DashboardScreen'
import PaymentFlowScreen from './src/screens/PaymentFlowScreen'
import OwnershipScreen from './src/screens/OwnershipScreen'


const Stack = createStackNavigator()

export default function App() {
  // Ensure Buffer is available as a fallback
  if (typeof global.Buffer === 'undefined') {
    try {
      const { Buffer } = require('@craftzdog/react-native-buffer');
      global.Buffer = Buffer;
      globalThis.Buffer = Buffer;
    } catch (error) {
      console.error('Failed to load Buffer in App component:', error);
    }
  }

  // PWA setup for web
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Register service worker
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      }

      // Add PWA meta tags
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (!metaThemeColor) {
        const meta = document.createElement('meta');
        meta.name = 'theme-color';
        meta.content = '#5252D7';
        document.head.appendChild(meta);
      }

      // Add viewport meta tag for responsive design
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
      }

      // Add smooth scrolling
      document.documentElement.style.scrollBehavior = 'smooth';
    }
  }, []);

  const [fontsLoaded] = useFonts({
    'NB International Pro': require('./assets/fonts/nb_international_pro_regular-webfont.ttf'),
    'NB International Pro Bold': require('./assets/fonts/nb_international_pro_bold-webfont.ttf'),
  })

  if (!fontsLoaded) {
    return null
  }

  return (
    <ThemeProvider>
      <PlatformProviders>
        <MachineManagerProvider>
          <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
            <GestureHandlerRootView style={{ flex: 1 }}>
              <SafeAreaProvider>
                <GlobalUserInfo>
                  <NavigationContainer>
                <StatusBar style="light" backgroundColor="#0E0D0C" />
                <Stack.Navigator
                  initialRouteName="Splash"
                  screenOptions={{
                    headerShown: false,
                    cardStyle: { backgroundColor: '#0E0D0C' },
                    animation: 'default',
                    gestureEnabled: true,
                    cardStyleInterpolator: ({ current }) => ({
                      cardStyle: {
                        opacity: current.progress,
                      },
                    }),
                  }}
                >
                  <Stack.Screen name="Splash" component={SplashScreen} />
                  <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                  <Stack.Screen name="MachineSelection" component={MachineSelectionScreen} />
                  <Stack.Screen name="Dashboard" component={DashboardScreen} />
                  <Stack.Screen name="PaymentFlow" component={PaymentFlowScreen} />
                  <Stack.Screen name="Ownership" component={OwnershipScreen} />
                </Stack.Navigator>
                  </NavigationContainer>
                </GlobalUserInfo>
              </SafeAreaProvider>
            </GestureHandlerRootView>
          </TamaguiProvider>
        </MachineManagerProvider>
      </PlatformProviders>
    </ThemeProvider>
  )

}