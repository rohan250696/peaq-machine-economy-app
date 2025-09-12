import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Alert } from 'react-native'
import { MotiView } from 'moti'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { usePrivy, useLogin } from '../hooks/usePlatformAuth'
import { RootStackParamList } from '../types'
import { responsive } from '../utils/responsive'
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
  useEffect(() => {
    if (ready && authenticated) {
      navigation.replace('MachineSelection')
    }
  }, [ready, authenticated, navigation])

  // Auto-trigger Privy modal on component mount
  useEffect(() => {
    if (ready && !authenticated) {
      // Small delay to ensure component is fully mounted
      const timer = setTimeout(() => {
        handleLogin()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [ready, authenticated])

  const handleLogin = async () => {
    setIsLoading(true)
    try {
      console.log('Opening Privy login modal')
      await login()
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
    buttonText: {
      color: colors.text,
    },
  }), [colors])

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      {/* Welcome Content */}
      <MotiView
        from={{ opacity: 0, translateY: 30 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{
          type: 'spring',
          damping: 15,
          stiffness: 100,
        }}
        style={styles.content}
      >
        {/* Logo/Icon */}
        <MotiView
          from={{ scale: 0, rotate: '0deg' }}
          animate={{ scale: 1, rotate: '360deg' }}
          transition={{
            type: 'spring',
            damping: 10,
            stiffness: 100,
            delay: 200,
          }}
          style={styles.logoContainer}
        >
          <Text style={styles.logoEmoji}>🤖</Text>
        </MotiView>

        {/* Title */}
        <Text style={[styles.title, dynamicStyles.title]}>Welcome to peaq</Text>
        
        {/* Subtitle */}
        <Text style={[styles.subtitle, dynamicStyles.subtitle]}>
          Connect your wallet to start earning from{'\n'}autonomous machines
        </Text>

        {/* Login Button */}
        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          <Text style={[styles.loginButtonText, dynamicStyles.buttonText]}>
            {isLoading ? 'Connecting...' : 'Get Started'}
          </Text>
        </TouchableOpacity>

        {/* Loading Indicator */}
        {isLoading && (
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={styles.loadingContainer}
          >
            <Text style={[styles.loadingText, dynamicStyles.subtitle]}>
              Opening login options...
            </Text>
          </MotiView>
        )}
      </MotiView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: responsive(20, 24, 32),
  },
  content: {
    alignItems: 'center',
    maxWidth: responsive(400, 500, 600),
  },
  logoContainer: {
    width: responsive(80, 100, 120),
    height: responsive(80, 100, 120),
    borderRadius: responsive(40, 50, 60),
    backgroundColor: 'rgba(82, 82, 215, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: responsive(24, 32, 40),
    borderWidth: 2,
    borderColor: 'rgba(82, 82, 215, 0.3)',
  },
  logoEmoji: {
    fontSize: responsive(40, 50, 60),
  },
  title: {
    fontSize: responsive(32, 40, 48),
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: responsive(16, 20, 24),
    fontFamily: 'NB International Pro Bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: responsive(16, 18, 20),
    textAlign: 'center',
    lineHeight: responsive(24, 28, 32),
    fontFamily: 'NB International Pro',
    marginBottom: responsive(32, 40, 48),
    color: '#A7A6A5',
  },
  loginButton: {
    backgroundColor: '#5252D7',
    paddingVertical: responsive(16, 20, 24),
    paddingHorizontal: responsive(32, 40, 48),
    borderRadius: responsive(16, 20, 24),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loginButtonText: {
    fontSize: responsive(16, 18, 20),
    fontWeight: 'bold',
    fontFamily: 'NB International Pro Bold',
    color: '#FFFFFF',
  },
  loadingContainer: {
    marginTop: responsive(16, 20, 24),
    alignItems: 'center',
  },
  loadingText: {
    fontSize: responsive(14, 16, 18),
    fontFamily: 'NB International Pro',
    color: '#A7A6A5',
  },
})