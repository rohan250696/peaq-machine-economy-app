import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image, ScrollView } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { MotiView } from 'moti'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { RootStackParamList, Machine, Ownership } from '../types'
import { GRADIENTS, GLASSMORPHISM } from '../constants'
import { responsive } from '../utils/responsive'
import { useTheme } from '../contexts/ThemeContext'

const { width, height } = Dimensions.get('window')

type OwnershipScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Ownership'>
type OwnershipScreenRouteProp = RouteProp<RootStackParamList, 'Ownership'>

export default function OwnershipScreen() {
  const navigation = useNavigation<OwnershipScreenNavigationProp>()
  const route = useRoute<OwnershipScreenRouteProp>()
  const { machine, ownership } = route.params
  const { colors } = useTheme()
  
  const [showConfetti, setShowConfetti] = useState(true)
  const [animatedPercentage, setAnimatedPercentage] = useState(0)

  useEffect(() => {
    // Hide confetti after animation
    const timer = setTimeout(() => {
      setShowConfetti(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Animate percentage counter
    const animatePercentage = () => {
      let current = 0
      const increment = ownership.percentage / 30
      const timer = setInterval(() => {
        current += increment
        if (current >= ownership.percentage) {
          current = ownership.percentage
          clearInterval(timer)
        }
        setAnimatedPercentage(current)
      }, 30)
    }
    
    setTimeout(animatePercentage, 500)
  }, [ownership.percentage])

  const handleViewDashboard = () => {
    navigation.replace('Dashboard')
  }

  const handleBackToMachines = () => {
    navigation.navigate('MachineSelection')
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
    cardBackground: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    cardTitle: {
      color: colors.text,
    },
    cardSubtitle: {
      color: colors.textSecondary,
    },
    percentageText: {
      color: colors.primary,
    },
    earningsText: {
      color: colors.success,
    },
    machineName: {
      color: colors.text,
    },
    machineLocation: {
      color: colors.textSecondary,
    },
    buttonText: {
      color: colors.text,
    },
    statsValue: {
      color: colors.primary,
    },
    statsLabel: {
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
      {/* Confetti Animation */}
      {showConfetti && (
        <View style={styles.confettiContainer}>
          {[...Array(20)].map((_, index) => (
            <MotiView
              key={index}
              from={{
                opacity: 1,
                translateY: -100,
                translateX: Math.random() * width - width / 2,
                rotate: '0deg',
                scale: 1,
              }}
              animate={{
                opacity: 0,
                translateY: height + 100,
                translateX: Math.random() * width - width / 2,
                rotate: '360deg',
                scale: 0.5,
              }}
              transition={{
                type: 'timing',
                duration: 3000,
                delay: index * 100,
              }}
              style={[
                styles.confetti,
                {
                  backgroundColor: ['#5252D7', '#8484FE', '#CC940A', '#1D8359', '#FF5F52'][index % 5],
                  left: Math.random() * width,
                }
              ]}
            />
          ))}
        </View>
      )}

        {/* Modern Success Header */}
        <MotiView
          from={{ opacity: 0, translateY: -50 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'spring',
            damping: 15,
            stiffness: 100,
          }}
          style={[styles.modernHeader, { paddingTop: responsive(90, 100, 110) }]}
        >
          <View style={styles.headerContent}>
            <MotiView
              from={{ scale: 0, rotate: '0deg' }}
              animate={{ scale: 1, rotate: '360deg' }}
              transition={{
                type: 'spring',
                damping: 10,
                stiffness: 100,
                delay: 200,
              }}
              style={styles.successIcon}
            >
              <Text style={styles.successEmoji}>🎉</Text>
            </MotiView>
            
            <View style={styles.headerText}>
              <Text style={dynamicStyles.title}>Congratulations!</Text>
              <Text style={dynamicStyles.subtitle}>
                You now own a piece of {machine.name}
              </Text>
            </View>
          </View>
        </MotiView>

          {/* Ownership Card */}
          <MotiView
            from={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: 'spring',
              damping: 15,
              stiffness: 100,
              delay: 300,
            }}
            style={styles.ownershipCard}
          >
            <View style={[styles.cardGradient, dynamicStyles.cardBackground]}>
              {/* Machine Image */}
              <View style={styles.machineImageContainer}>
                <Image source={{ uri: machine.image }} style={styles.machineImage} />
                <View style={styles.ownershipBadge}>
                  <Text style={styles.ownershipBadgeText}>OWNED</Text>
                </View>
              </View>

              {/* Ownership Details */}
              <View style={styles.ownershipDetails}>
                <Text style={[styles.machineName, dynamicStyles.machineName]}>{machine.name}</Text>
                <Text style={[styles.machineType, dynamicStyles.cardSubtitle]}>{machine.type}</Text>
                
                {/* Percentage Display */}
                <View style={styles.percentageContainer}>
                  <Text style={[styles.percentageLabel, dynamicStyles.statsLabel]}>Ownership</Text>
                  <Text style={[styles.percentageValue, dynamicStyles.percentageText]}>
                    {animatedPercentage.toFixed(1)}%
                  </Text>
                </View>

                {/* Earnings Display */}
                <View style={styles.earningsContainer}>
                  <Text style={[styles.earningsLabel, dynamicStyles.statsLabel]}>Total Earnings</Text>
                  <Text style={[styles.earningsValue, dynamicStyles.earningsText]}>
                    {ownership.earnings.toFixed(4)} PEAQ
                  </Text>
                </View>

                {/* Tokens Display */}
                <View style={styles.tokensContainer}>
                  <Text style={[styles.tokensLabel, dynamicStyles.statsLabel]}>Tokens Owned</Text>
                  <Text style={[styles.tokensValue, dynamicStyles.statsValue]}>
                    {ownership.tokens.toLocaleString()} / {ownership.totalTokens.toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>
          </MotiView>

          {/* Action Buttons */}
          <MotiView
            from={{ opacity: 0, translateY: 30 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{
              type: 'spring',
              damping: 15,
              stiffness: 100,
              delay: 600,
            }}
            style={styles.actionsContainer}
          >
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleViewDashboard}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={GRADIENTS.primary as [string, string]}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={[styles.primaryButtonText, dynamicStyles.buttonText]}>View Dashboard</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleBackToMachines}
              activeOpacity={0.8}
            >
              <Text style={[styles.secondaryButtonText, dynamicStyles.buttonText]}>Explore More Machines</Text>
            </TouchableOpacity>
          </MotiView>

          {/* Extra content to ensure scrolling */}
          <View style={styles.extraContent}>
            <Text style={[styles.extraText, dynamicStyles.cardSubtitle]}>🎉 Congratulations on your first machine ownership!</Text>
            <Text style={[styles.extraText, dynamicStyles.cardSubtitle]}>💰 Start earning passive income from autonomous machines</Text>
            <Text style={[styles.extraText, dynamicStyles.cardSubtitle]}>📈 Track your earnings in the dashboard</Text>
            <Text style={[styles.extraText, dynamicStyles.cardSubtitle]}>🔄 Explore more machines to diversify your portfolio</Text>
            <Text style={[styles.extraText, dynamicStyles.cardSubtitle]}>🚀 Join the machine economy revolution!</Text>
            <Text style={[styles.extraText, dynamicStyles.cardSubtitle]}>💎 Your fractional ownership is now live</Text>
          </View>
    </div>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E0D0C',
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  confetti: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  gradientContent: {
    minHeight: height,
    paddingHorizontal: 32,
    paddingTop: 100,
    paddingBottom: 120,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  modernHeader: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  headerContent: {
    alignItems: 'center',
    gap: 16,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(82, 82, 215, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(82, 82, 215, 0.3)',
  },
  headerText: {
    alignItems: 'center',
    gap: 8,
  },
  successEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'NB International Pro Bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    fontFamily: 'NB International Pro',
  },
  ownershipCard: {
    marginBottom: 40,
    marginHorizontal: 8,
    borderRadius: 20,
    overflow: 'hidden',
    ...GLASSMORPHISM.shadow,
  },
  cardGradient: {
    padding: 32,
  },
  machineImageContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 24,
  },
  machineImage: {
    width: 120,
    height: 120,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  ownershipBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#06B6D4',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ownershipBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'NB International Pro Bold',
  },
  ownershipDetails: {
    alignItems: 'center',
  },
  machineName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    fontFamily: 'NB International Pro Bold',
    textAlign: 'center',
  },
  machineType: {
    fontSize: 16,
    color: '#A7A6A5',
    marginBottom: 24,
    fontFamily: 'NB International Pro',
    textAlign: 'center',
  },
  percentageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  percentageLabel: {
    fontSize: 14,
    color: '#A7A6A5',
    marginBottom: 8,
    fontFamily: 'NB International Pro',
  },
  percentageValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#06B6D4',
    fontFamily: 'NB International Pro Bold',
  },
  earningsContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  earningsLabel: {
    fontSize: 14,
    color: '#A7A6A5',
    marginBottom: 8,
    fontFamily: 'NB International Pro',
  },
  earningsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'NB International Pro Bold',
  },
  tokensContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  tokensLabel: {
    fontSize: 14,
    color: '#A7A6A5',
    marginBottom: 8,
    fontFamily: 'NB International Pro',
  },
  tokensValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5252D7',
    fontFamily: 'NB International Pro',
  },
  actionsContainer: {
    marginBottom: 40,
    paddingHorizontal: 8,
    gap: 20,
  },
  primaryButton: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    ...GLASSMORPHISM.shadow,
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'NB International Pro Bold',
  },
  secondaryButton: {
    backgroundColor: GLASSMORPHISM.background,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: GLASSMORPHISM.border,
    ...GLASSMORPHISM.shadow,
  },
  secondaryButtonText: {
    fontSize: 16,
    color: '#5252D7',
    fontWeight: '600',
    fontFamily: 'NB International Pro',
  },
  extraContent: {
    marginTop: 40,
    marginHorizontal: 8,
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: 'rgba(82, 82, 215, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(82, 82, 215, 0.1)',
  },
  extraText: {
    fontSize: 14,
    color: '#A7A6A5',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'NB International Pro',
    lineHeight: 20,
  },
})