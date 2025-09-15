import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useTheme } from '../contexts/ThemeContext'

interface PeaqSharingTokenIconProps {
  size?: number
  showText?: boolean
  animated?: boolean
}

export default function PeaqSharingTokenIcon({ 
  size = 32, 
  showText = true,
  animated = false 
}: PeaqSharingTokenIconProps) {
  const { colors } = useTheme()

  const LogoContent = () => (
    <LinearGradient
      colors={['#5252D7', '#8484FE']}
      style={[styles.logo, { width: size, height: size }]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {showText && (
        <Text style={[styles.logoText, { fontSize: size * 0.4 }]}>
          peaq
        </Text>
      )}
    </LinearGradient>
  )

  return <LogoContent />
}

const styles = StyleSheet.create({
  logo: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    // Use boxShadow instead of deprecated shadow props
    boxShadow: '0 4px 8px rgba(82, 82, 215, 0.3)',
    elevation: 8, // Keep elevation for Android
  },
  logoText: {
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'NB International Pro Bold',
  },
})
