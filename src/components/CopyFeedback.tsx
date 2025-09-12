import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { MotiView } from 'moti'
import { LinearGradient } from 'expo-linear-gradient'
import { spacing, fontSizes, responsive } from './ResponsiveLayout'

interface CopyFeedbackProps {
  visible: boolean
  onHide: () => void
}

export default function CopyFeedback({ visible, onHide }: CopyFeedbackProps) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onHide()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [visible, onHide])

  if (!visible) return null

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.8, translateY: -20 }}
      animate={{ opacity: 1, scale: 1, translateY: 0 }}
      exit={{ opacity: 0, scale: 0.8, translateY: -20 }}
      transition={{
        type: 'spring',
        damping: 15,
        stiffness: 200,
      }}
      style={styles.container}
    >
      <LinearGradient
        colors={['#5252D7', '#8484FE']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.icon}>✓</Text>
        <Text style={styles.text}>Copied!</Text>
      </LinearGradient>
    </MotiView>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: responsive(60, 80, 100),
    right: spacing.lg,
    zIndex: 1000,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 25,
    ...responsive({
      shadowColor: '#5252D7',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    }),
  },
  icon: {
    fontSize: fontSizes.sm,
    color: '#FFFFFF',
    marginRight: spacing.xs,
    fontWeight: 'bold',
  },
  text: {
    fontSize: fontSizes.sm,
    color: '#FFFFFF',
    fontFamily: 'NB International Pro',
    fontWeight: '600',
  },
})
