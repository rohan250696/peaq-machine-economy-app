import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { MotiView } from 'moti'
import { spacing, fontSizes } from '../utils/responsive'

interface UserBalanceProps {
  balance: number
  onRefresh?: () => void
  showRefresh?: boolean
}

export default function UserBalance({ balance, onRefresh, showRefresh = true }: UserBalanceProps) {
  const [animatedBalance, setAnimatedBalance] = useState(0)

  useEffect(() => {
    // Animate balance change
    const duration = 1000
    const steps = 30
    const stepDuration = duration / steps
    const increment = balance / steps

    let currentStep = 0
    const interval = setInterval(() => {
      currentStep++
      setAnimatedBalance(Math.min(increment * currentStep, balance))
      
      if (currentStep >= steps) {
        clearInterval(interval)
        setAnimatedBalance(balance)
      }
    }, stepDuration)

    return () => clearInterval(interval)
  }, [balance])

  const formatBalance = (amount: number) => {
    return amount.toFixed(4)
  }

  const getGradientColors = () => {
    return ['#5252D7', '#8484FE']
  }

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: 'spring',
        damping: 15,
        stiffness: 100,
      }}
      style={styles.container}
    >
      <LinearGradient
        colors={getGradientColors()}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          <View style={styles.balanceInfo}>
            <Text style={styles.label}>Wallet Balance</Text>
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                type: 'timing',
                duration: 500,
              }}
            >
              <Text style={styles.balance}>
                {formatBalance(animatedBalance)} PEAQ
              </Text>
            </MotiView>
            <Text style={styles.subtext}>
              Available for machine interactions
            </Text>
          </View>
          
          {showRefresh && onRefresh && (
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={onRefresh}
              activeOpacity={0.7}
            >
              <Text style={styles.refreshIcon}>🔄</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </MotiView>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  gradient: {
    padding: spacing.lg,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceInfo: {
    flex: 1,
  },
  label: {
    fontSize: fontSizes.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'NB International Pro',
    marginBottom: spacing.xs,
  },
  balance: {
    fontSize: fontSizes.xxxl,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'NB International Pro Bold',
    marginBottom: spacing.xs,
  },
  subtext: {
    fontSize: fontSizes.xs,
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: 'NB International Pro',
  },
  refreshButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshIcon: {
    fontSize: 16,
  },
})
