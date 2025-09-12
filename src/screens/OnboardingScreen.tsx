import React, { useState } from 'react'
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Alert, ScrollView } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { MotiView } from 'moti'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { usePrivy, useLogin } from '../hooks/usePlatformAuth'
import { RootStackParamList } from '../types'
import { GLASSMORPHISM } from '../constants'
import { scaleWidth, scaleHeight, spacing, fontSizes, safeAreaPadding, isSmallScreen, layout, responsive } from '../utils/responsive'
import { createAccessibleButton, createAccessibleCard } from '../utils/accessibility'
import SocialLoginButton from '../components/SocialLoginButton'
import PeaqNetworkStatus from '../components/PeaqNetworkStatus'
import { useTheme } from '../contexts/ThemeContext'

const { width, height } = Dimensions.get('window')

type OnboardingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Onboarding'>

export default function OnboardingScreen() {
  const navigation = useNavigation<OnboardingScreenNavigationProp>()
  const { authenticated, ready } = usePrivy()
  const { login } = useLogin()
  const { colors } = useTheme()
  const [isLoading, setIsLoading] = useState(false)

  // Redirect if already authenticated
  React.useEffect(() => {
    if (ready && authenticated) {
      navigation.replace('MachineSelection')
    }
  }, [ready, authenticated, navigation])

  const handleSocialLogin = async (provider: 'google' | 'apple' | 'twitter') => {
    setIsLoading(true)
    try {
      console.log(`Logging in with ${provider}`)
      
      // Use Privy login with specific method
      await login()
      
      // Navigation will be handled by the useEffect above
    } catch (error) {
      console.error('Login failed:', error)
      Alert.alert('Login Failed', 'Please try again')
    } finally {
      setIsLoading(false)
    }
  }


  // Create dynamic styles based on theme
  const dynamicStyles = React.useMemo(() => StyleSheet.create({
    container: {
      backgroundColor: colors.background,
    },
    title: {
      color: colors.text,
    },
    subtitle: {
      color: colors.textSecondary,
    },
  }), [colors])

  return (
    <div style={{
      height: '100vh',
      backgroundColor: colors.background,
      color: colors.text,
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch'
    }}>
      {/* Background Elements */}
      <MotiView
        from={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.1, scale: 1 }}
        transition={{
          type: 'timing',
          duration: 3000,
          loop: true,
        }}
        style={styles.backgroundElement}
      />

        {/* Header */}
        <MotiView
          from={{ opacity: 0, translateY: -50 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'timing',
            duration: 800,
          }}
          style={styles.header}
        >
          <Text style={dynamicStyles.title}>Welcome to peaq</Text>
          <Text style={dynamicStyles.subtitle}>
            Connect your wallet to start earning from{'\n'}autonomous machines
          </Text>
        </MotiView>

        {/* Social Login Options */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'timing',
            duration: 800,
            delay: 300,
          }}
          style={styles.optionsContainer}
        >
          <View style={styles.socialOptions}>
            <SocialLoginButton
              provider="google"
              onPress={() => handleSocialLogin('google')}
              disabled={isLoading}
            />
            
            <SocialLoginButton
              provider="apple"
              onPress={() => handleSocialLogin('apple')}
              disabled={isLoading}
            />
            
            <SocialLoginButton
              provider="twitter"
              onPress={() => handleSocialLogin('twitter')}
              disabled={isLoading}
            />
          </View>
          
        </MotiView>

        {/* Show network status after login */}
        {authenticated && (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{
              type: 'timing',
              duration: 600,
              delay: 500,
            }}
            style={styles.networkStatusContainer}
          >
            <PeaqNetworkStatus 
              showSwitchButton={true}
            />
          </MotiView>
        )}

        {/* Footer */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            type: 'timing',
            duration: 800,
            delay: 900,
          }}
          style={styles.footer}
        >
          <Text style={styles.footerText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
          
        </MotiView>
    </div>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundElement: {
    position: 'absolute',
    width: width * 1.5,
    height: height * 1.5,
    backgroundColor: '#5252D7',
    borderRadius: width * 0.75,
    top: -height * 0.3,
    right: -width * 0.3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: safeAreaPadding.horizontal,
    paddingTop: safeAreaPadding.top,
    paddingBottom: safeAreaPadding.bottom + spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: responsive(fontSizes.largeTitle, fontSizes.huge),
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: spacing.md,
    fontFamily: 'NB International Pro Bold',
    lineHeight: responsive(fontSizes.largeTitle * 1.2, fontSizes.huge * 1.2),
  },
  subtitle: {
    fontSize: responsive(fontSizes.lg, fontSizes.xl),
    textAlign: 'center',
    lineHeight: responsive(fontSizes.lg * 1.5, fontSizes.xl * 1.5),
    fontFamily: 'NB International Pro',
    paddingHorizontal: spacing.sm,
  },
  tabContainer: {
    marginBottom: spacing.xxl,
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: GLASSMORPHISM.card.background,
    borderRadius: layout.cardRadius,
    padding: spacing.xs,
    borderWidth: 1,
    borderColor: GLASSMORPHISM.card.border,
    ...GLASSMORPHISM.card.shadow,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: layout.cardRadius - 4,
    alignItems: 'center',
    minHeight: layout.buttonHeightSmall,
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: '#5252D7',
  },
  tabText: {
    fontSize: responsive(fontSizes.md, fontSizes.lg),
    color: '#A7A6A5',
    fontFamily: 'NB International Pro',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  optionsContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  socialOptions: {
    gap: spacing.md,
  },
  networkStatusContainer: {
    marginTop: spacing.lg,
  },
  walletOptions: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: layout.cardRadius,
    backgroundColor: GLASSMORPHISM.button.background,
    borderWidth: 1,
    borderColor: GLASSMORPHISM.button.border,
    minHeight: layout.buttonHeight,
    ...GLASSMORPHISM.button.shadow,
  },
  googleButton: {
    backgroundColor: 'rgba(66, 133, 244, 0.1)',
    borderColor: 'rgba(66, 133, 244, 0.3)',
  },
  appleButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  twitterButton: {
    backgroundColor: 'rgba(29, 161, 242, 0.1)',
    borderColor: 'rgba(29, 161, 242, 0.3)',
  },
  walletButton: {
    backgroundColor: 'rgba(82, 82, 215, 0.1)',
    borderColor: 'rgba(82, 82, 215, 0.3)',
    minWidth: responsive(200, 240),
  },
  buttonEmoji: {
    fontSize: responsive(20, 24),
    marginRight: spacing.md,
  },
  buttonText: {
    fontSize: responsive(fontSizes.lg, fontSizes.xl),
    color: '#FFFFFF',
    fontWeight: '600',
    fontFamily: 'NB International Pro',
  },
  walletDescription: {
    fontSize: responsive(fontSizes.md, fontSizes.lg),
    color: '#A7A6A5',
    textAlign: 'center',
    lineHeight: responsive(fontSizes.md * 1.4, fontSizes.lg * 1.4),
    fontFamily: 'NB International Pro',
    paddingHorizontal: spacing.md,
  },
  footer: {
    alignItems: 'center',
    paddingTop: spacing.lg,
  },
  footerText: {
    fontSize: responsive(fontSizes.sm, fontSizes.md),
    color: '#747372',
    textAlign: 'center',
    lineHeight: responsive(fontSizes.sm * 1.3, fontSizes.md * 1.3),
    fontFamily: 'NB International Pro',
    paddingHorizontal: spacing.md,
  },
})
