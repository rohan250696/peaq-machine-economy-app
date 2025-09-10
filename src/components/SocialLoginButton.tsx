import React from 'react'
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { MotiView } from 'moti'
import { spacing, fontSizes } from '../utils/responsive'

interface SocialLoginButtonProps {
  provider: 'google' | 'apple' | 'twitter'
  onPress: () => void
  disabled?: boolean
}

const socialConfig = {
  google: {
    icon: '🔍',
    label: 'Continue with Google',
    colors: ['#4285F4', '#34A853'],
    gradient: ['#4285F4', '#34A853'],
  },
  apple: {
    icon: '🍎',
    label: 'Continue with Apple',
    colors: ['#000000', '#1D1D1F'],
    gradient: ['#000000', '#1D1D1F'],
  },
  twitter: {
    icon: '🐦',
    label: 'Continue with Twitter',
    colors: ['#1DA1F2', '#0D8BD9'],
    gradient: ['#1DA1F2', '#0D8BD9'],
  },
}

export default function SocialLoginButton({ provider, onPress, disabled = false }: SocialLoginButtonProps) {
  const config = socialConfig[provider]

  const getButtonColors = () => {
    return config.gradient
  }

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        type: 'spring',
        damping: 15,
        stiffness: 100,
      }}
    >
      <TouchableOpacity
        style={[styles.container, disabled && styles.disabled]}
        onPress={onPress}
        activeOpacity={0.8}
        disabled={disabled}
      >
        <LinearGradient
          colors={getButtonColors()}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>{config.icon}</Text>
            </View>
            <Text style={styles.label}>{config.label}</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </MotiView>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  disabled: {
    opacity: 0.5,
  },
  gradient: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: spacing.sm,
  },
  icon: {
    fontSize: 20,
  },
  label: {
    fontSize: fontSizes.md,
    color: '#FFFFFF',
    fontFamily: 'NB International Pro',
    fontWeight: '600',
    textAlign: 'center',
  },
})
