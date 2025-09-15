import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image, ScrollView, SafeAreaView } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { MotiView } from 'moti'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { RootStackParamList, Machine } from '../types'
import { GRADIENTS, GLASSMORPHISM } from '../constants'
import { responsive } from '../utils/responsive'
import { useTheme } from '../contexts/ThemeContext'
import { useAccount } from 'wagmi'
import { useMachineInfo, useProfitTokenBalance } from '../contexts/MachineManagerContext'

const { width, height } = Dimensions.get('window')

type OwnershipScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Ownership'>
type OwnershipScreenRouteProp = RouteProp<RootStackParamList, 'Ownership'>

export default function OwnershipScreen() {
  const navigation = useNavigation<OwnershipScreenNavigationProp>()
  const route = useRoute<OwnershipScreenRouteProp>()
  const { machine } = route.params
  const { colors } = useTheme()
  const { address } = useAccount()
  
  // Get real-time machine data from contract
  const { machineInfo, isLoading: machineInfoLoading } = useMachineInfo(machine.id)
  
  // Get peaqPFT token balance
  const { balance: peaqPFTBalance, isLoading: peaqPFTBalanceLoading } = useProfitTokenBalance(address || '')
  
  const [showConfetti, setShowConfetti] = useState(true)
  const [animatedPercentage, setAnimatedPercentage] = useState(0)

  useEffect(() => {
    // Hide confetti after animation
    const timer = setTimeout(() => {
      setShowConfetti(false)
    }, 3000)
    
    // Animate percentage
    const animateTimer = setTimeout(() => {
      setAnimatedPercentage(100)
    }, 500)
    
    return () => {
      clearTimeout(timer)
      clearTimeout(animateTimer)
    }
  }, [])

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
    card: {
      backgroundColor: colors.card,
      borderColor: colors.border,
    },
    text: {
      color: colors.text,
    },
    textSecondary: {
      color: colors.textSecondary,
    },
    successText: {
      color: colors.primary,
    },
    statusBadge: {
      backgroundColor: 'rgba(29, 131, 89, 0.1)',
      borderColor: 'rgba(29, 131, 89, 0.3)',
    },
    machineName: {
      color: colors.text,
    },
    machineAddress: {
      color: colors.textSecondary,
    },
    buttonText: {
      color: colors.text,
    },
    backButton: {
      backgroundColor: colors.primary,
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
        {/* Main Content Wrapper */}
        <View style={styles.mainWrapper}>
          {/* Modern Hero Section */}
          <LinearGradient
            colors={GRADIENTS.primary as any}
            style={styles.heroSection}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
          <MotiView
            from={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: 'spring',
              damping: 15,
              stiffness: 150,
            }}
          >
            <View style={styles.heroContent}>
              <View style={styles.successIconContainer}>
                <Text style={styles.successIcon}>✅</Text>
              </View>
              <Text style={[styles.heroTitle, dynamicStyles.title]}>
                Success!
              </Text>
              <Text style={[styles.heroSubtitle, dynamicStyles.subtitle]}>
                Machine transaction completed successfully
              </Text>
            </View>
          </MotiView>
        </LinearGradient>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Machine Overview Card */}
          <MotiView
            from={{ opacity: 0, translateY: 30 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{
              type: 'timing',
              duration: 600,
              delay: 200,
            }}
            style={[styles.overviewCard, dynamicStyles.card]}
          >
            <View style={styles.overviewHeader}>
              <View style={styles.machineImageContainer}>
                <Image
                  source={
                    machine.type === 'RoboCafe'
                      ? require('../../assets/coffee-robo-image.png')
                      : require('../../assets/humanoid.png')
                  }
                  style={styles.machineImage}
                  resizeMode="cover"
                />
              </View>
              <View style={styles.overviewInfo}>
                <Text style={[styles.overviewTitle, dynamicStyles.machineName]}>
                  {machineInfo?.name || machine.name}
                </Text>
                <Text style={[styles.overviewSubtitle, dynamicStyles.machineAddress]}>
                  {machine.type} Machine
                </Text>
                <View style={[styles.statusIndicator, dynamicStyles.statusBadge]}>
                  <Text style={styles.statusText}>Transaction Complete</Text>
                </View>
              </View>
            </View>
          </MotiView>

          {/* Stats Grid */}
          <MotiView
            from={{ opacity: 0, translateY: 30 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{
              type: 'timing',
              duration: 600,
              delay: 400,
            }}
            style={styles.statsGrid}
          >
            <View style={[styles.statCard, dynamicStyles.card]}>
              <Text style={[styles.statLabel, dynamicStyles.textSecondary]}>Price Paid</Text>
              <Text style={[styles.statValue, dynamicStyles.text]}>
                {machineInfo?.price || machine.price}
              </Text>
              <Text style={[styles.statUnit, dynamicStyles.textSecondary]}>PEAQ</Text>
            </View>
            
            <View style={[styles.statCard, dynamicStyles.card]}>
              <Text style={[styles.statLabel, dynamicStyles.textSecondary]}>Platform Fee</Text>
              <Text style={[styles.statValue, dynamicStyles.text]}>
                {machineInfo?.platformFeeBps || machine.platformFeeBps}
              </Text>
              <Text style={[styles.statUnit, dynamicStyles.textSecondary]}>bps</Text>
            </View>
          </MotiView>

          {/* Token Balance Card */}
          <MotiView
            from={{ opacity: 0, translateY: 30 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{
              type: 'timing',
              duration: 600,
              delay: 600,
            }}
            style={[styles.tokenCard, dynamicStyles.card]}
          >
            <View style={styles.tokenHeader}>
              <Text style={[styles.tokenTitle, dynamicStyles.text]}>Your Tokens</Text>
              <Text style={[styles.tokenSubtitle, dynamicStyles.textSecondary]}>
                Profit-sharing tokens earned
              </Text>
            </View>
            
            <View style={styles.tokenBalanceDisplay}>
              <View style={styles.tokenIconContainer}>
                <Text style={styles.tokenIcon}>🪙</Text>
              </View>
              <View style={styles.tokenBalanceInfo}>
                <Text style={[styles.tokenBalanceValue, dynamicStyles.successText]}>
                  {peaqPFTBalanceLoading ? 'Loading...' : `${parseFloat(peaqPFTBalance || '0')}`}
                </Text>
                <Text style={[styles.tokenBalanceSymbol, dynamicStyles.textSecondary]}>
                  peaqPFT
                </Text>
              </View>
            </View>
            
            <View style={styles.tokenDescription}>
              <Text style={[styles.tokenDescriptionText, dynamicStyles.textSecondary]}>
                These tokens represent your share in the machine's future profits and can be used for governance and rewards.
              </Text>
            </View>
          </MotiView>

          {/* Back Button */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{
              type: 'timing',
              duration: 600,
              delay: 800,
            }}
            style={styles.backButtonContainer}
          >
            <TouchableOpacity
              style={[styles.backButton, dynamicStyles.backButton]}
              onPress={handleBackToMachines}
              activeOpacity={0.8}
            >
              <Text style={styles.backButtonIcon}>←</Text>
              <Text style={[styles.backButtonText, dynamicStyles.buttonText]}>
                Back to Machines
              </Text>
            </TouchableOpacity>
          </MotiView>
          
          {/* Bottom Spacer */}
          <View style={styles.bottomSpacer} />
        </View>
        </View>
    </div>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainWrapper: {
    paddingTop: responsive(20, 30, 40),
    paddingBottom: responsive(40, 50, 60),
  },
  heroSection: {
    paddingTop: responsive(100, 120, 140),
    paddingBottom: responsive(40, 50, 60),
    paddingHorizontal: responsive(20, 24, 28),
    justifyContent: 'center',
  },
  heroContent: {
    alignItems: 'center',
  },
  successIconContainer: {
    width: responsive(80, 90, 100),
    height: responsive(80, 90, 100),
    borderRadius: responsive(40, 45, 50),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: responsive(20, 24, 28),
  },
  successIcon: {
    fontSize: responsive(40, 45, 50),
  },
  heroTitle: {
    fontSize: responsive(28, 32, 36),
    fontFamily: 'NB International Pro Bold',
    textAlign: 'center',
    marginBottom: responsive(12, 16, 20),
    lineHeight: responsive(36, 40, 44),
  },
  heroSubtitle: {
    fontSize: responsive(16, 18, 20),
    fontFamily: 'NB International Pro',
    textAlign: 'center',
    lineHeight: responsive(22, 24, 26),
    opacity: 0.9,
    maxWidth: responsive(300, 340, 380),
  },
  mainContent: {
    padding: responsive(20, 24, 28),
    paddingTop: responsive(24, 28, 32),
  },
  overviewCard: {
    borderRadius: responsive(20, 24, 28),
    padding: responsive(24, 28, 32),
    marginBottom: responsive(20, 24, 28),
    borderWidth: 1,
    ...GLASSMORPHISM,
  },
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  machineImageContainer: {
    width: responsive(70, 80, 90),
    height: responsive(70, 80, 90),
    borderRadius: responsive(16, 18, 20),
    overflow: 'hidden',
    marginRight: responsive(20, 24, 28),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  machineImage: {
    width: '100%',
    height: '100%',
  },
  overviewInfo: {
    flex: 1,
  },
  overviewTitle: {
    fontSize: responsive(20, 22, 24),
    fontFamily: 'NB International Pro Bold',
    marginBottom: responsive(6, 8, 10),
  },
  overviewSubtitle: {
    fontSize: responsive(14, 16, 18),
    fontFamily: 'NB International Pro',
    opacity: 0.7,
    marginBottom: responsive(12, 14, 16),
  },
  statusIndicator: {
    alignSelf: 'flex-start',
    paddingHorizontal: responsive(12, 14, 16),
    paddingVertical: responsive(6, 8, 10),
    borderRadius: responsive(8, 10, 12),
    borderWidth: 1,
  },
  statusText: {
    fontSize: responsive(12, 14, 16),
    fontFamily: 'NB International Pro Bold',
    color: '#1D8359',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: responsive(16, 18, 20),
    marginBottom: responsive(20, 24, 28),
  },
  statCard: {
    flex: 1,
    borderRadius: responsive(16, 18, 20),
    padding: responsive(20, 22, 24),
    borderWidth: 1,
    alignItems: 'center',
    ...GLASSMORPHISM,
  },
  statLabel: {
    fontSize: responsive(12, 14, 16),
    fontFamily: 'NB International Pro',
    marginBottom: responsive(8, 10, 12),
    textAlign: 'center',
  },
  statValue: {
    fontSize: responsive(20, 22, 24),
    fontFamily: 'NB International Pro Bold',
    marginBottom: responsive(4, 6, 8),
    textAlign: 'center',
  },
  statUnit: {
    fontSize: responsive(10, 12, 14),
    fontFamily: 'NB International Pro',
    opacity: 0.7,
    textAlign: 'center',
  },
  tokenCard: {
    borderRadius: responsive(20, 24, 28),
    padding: responsive(24, 28, 32),
    marginBottom: responsive(20, 24, 28),
    borderWidth: 1,
    ...GLASSMORPHISM,
  },
  tokenHeader: {
    marginBottom: responsive(20, 24, 28),
  },
  tokenTitle: {
    fontSize: responsive(20, 22, 24),
    fontFamily: 'NB International Pro Bold',
    marginBottom: responsive(6, 8, 10),
  },
  tokenSubtitle: {
    fontSize: responsive(14, 16, 18),
    fontFamily: 'NB International Pro',
    opacity: 0.7,
  },
  tokenBalanceDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(82, 82, 215, 0.1)',
    padding: responsive(20, 24, 28),
    borderRadius: responsive(16, 18, 20),
    borderWidth: 1,
    borderColor: 'rgba(82, 82, 215, 0.2)',
    marginBottom: responsive(20, 24, 28),
  },
  tokenIconContainer: {
    width: responsive(50, 55, 60),
    height: responsive(50, 55, 60),
    borderRadius: responsive(25, 27, 30),
    backgroundColor: 'rgba(82, 82, 215, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: responsive(16, 18, 20),
  },
  tokenIcon: {
    fontSize: responsive(24, 26, 28),
  },
  tokenBalanceInfo: {
    flex: 1,
  },
  tokenBalanceValue: {
    fontSize: responsive(28, 32, 36),
    fontFamily: 'NB International Pro Bold',
    marginBottom: responsive(4, 6, 8),
  },
  tokenBalanceSymbol: {
    fontSize: responsive(14, 16, 18),
    fontFamily: 'NB International Pro',
    opacity: 0.7,
  },
  tokenDescription: {
    paddingTop: responsive(16, 18, 20),
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  tokenDescriptionText: {
    fontSize: responsive(14, 16, 18),
    fontFamily: 'NB International Pro',
    lineHeight: responsive(20, 22, 24),
    opacity: 0.8,
  },
  backButtonContainer: {
    marginTop: responsive(8, 12, 16),
  },
  backButton: {
    borderRadius: responsive(16, 18, 20),
    paddingVertical: responsive(18, 20, 22),
    paddingHorizontal: responsive(24, 28, 32),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: responsive(56, 60, 64),
    flexDirection: 'row',
  },
  backButtonIcon: {
    fontSize: responsive(18, 20, 22),
    marginRight: responsive(8, 10, 12),
    color: '#FFFFFF',
  },
  backButtonText: {
    fontSize: responsive(16, 18, 20),
    fontFamily: 'NB International Pro Bold',
  },
  bottomSpacer: {
    height: responsive(40, 50, 60),
  },
})