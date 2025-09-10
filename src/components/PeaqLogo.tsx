import React from 'react'
import { View, Text, StyleSheet, Dimensions } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { MotiView } from 'moti'
import { scaleWidth, scaleHeight, fontSizes } from '../utils/responsive'

const { width } = Dimensions.get('window')

interface PeaqLogoProps {
  size?: 'small' | 'medium' | 'large'
  animated?: boolean
  showText?: boolean
}

export default function PeaqLogo({ 
  size = 'medium', 
  animated = false, 
  showText = true 
}: PeaqLogoProps) {
  const getSize = () => {
    switch (size) {
      case 'small': return { 
        width: scaleWidth(40), 
        height: scaleWidth(40), 
        fontSize: fontSizes.sm 
      }
      case 'large': return { 
        width: scaleWidth(120), 
        height: scaleWidth(120), 
        fontSize: fontSizes.xxxl 
      }
      default: return { 
        width: scaleWidth(80), 
        height: scaleWidth(80), 
        fontSize: fontSizes.xxxl 
      }
    }
  }

  const { width, height, fontSize } = getSize()

  const LogoContent = () => (
    <LinearGradient
      colors={['#5252D7', '#8484FE']}
      style={[styles.logo, { width, height }]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Text style={[styles.logoText, { fontSize }]}>peaq</Text>
    </LinearGradient>
  )

  if (animated) {
    return (
      <MotiView
        from={{ opacity: 0, scale: 0.5, rotate: '-180deg' }}
        animate={{ opacity: 1, scale: 1, rotate: '0deg' }}
        transition={{
          type: 'spring',
          damping: 15,
          stiffness: 100,
        }}
      >
        <LogoContent />
      </MotiView>
    )
  }

  return <LogoContent />
}

const styles = StyleSheet.create({
  logo: {
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    // Use boxShadow instead of deprecated shadow props
    boxShadow: '0 8px 16px rgba(82, 82, 215, 0.3)',
    elevation: 16, // Keep elevation for Android
  },
  logoText: {
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'NB International Pro Bold',
  },
})
