import './src/polyfills'
import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { TamaguiProvider } from '@tamagui/core'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { PrivyProvider } from '@privy-io/react-auth'

import tamaguiConfig from './tamagui.config'
import { useFonts } from 'expo-font'
import privyConfig from './src/config/privy'

// Import screens
import SplashScreen from './src/screens/SplashScreen'
import OnboardingScreen from './src/screens/OnboardingScreen'
import MachineSelectionScreen from './src/screens/MachineSelectionScreen'
import ActionScreen from './src/screens/ActionScreen'
import PaymentFlowScreen from './src/screens/PaymentFlowScreen'
import OwnershipScreen from './src/screens/OwnershipScreen'
import DashboardScreen from './src/screens/DashboardScreen'

const Stack = createStackNavigator()

export default function App() {
  const [fontsLoaded] = useFonts({
    'NB International Pro': require('./assets/fonts/nb_international_pro_regular-webfont.ttf'),
    'NB International Pro Bold': require('./assets/fonts/nb_international_pro_bold-webfont.ttf'),
  })


  if (!fontsLoaded) {
    return null
  }

  return (
    <PrivyProvider
      appId={privyConfig.appId}
      config={privyConfig.config}
    >
      <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
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
                <Stack.Screen name="Action" component={ActionScreen} />
                <Stack.Screen name="PaymentFlow" component={PaymentFlowScreen} />
                <Stack.Screen name="Ownership" component={OwnershipScreen} />
                <Stack.Screen name="Dashboard" component={DashboardScreen} />
              </Stack.Navigator>
            </NavigationContainer>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </TamaguiProvider>
    </PrivyProvider>
  )
}