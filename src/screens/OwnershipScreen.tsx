import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image, ScrollView } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { MotiView } from 'moti'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { RootStackParamList, Machine, Ownership } from '../types'
import { GRADIENTS, GLASSMORPHISM } from '../constants'

const { width, height } = Dimensions.get('window')

type OwnershipScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Ownership'>
type OwnershipScreenRouteProp = RouteProp<RootStackParamList, 'Ownership'>

export default function OwnershipScreen() {
  const navigation = useNavigation<OwnershipScreenNavigationProp>()
  const route = useRoute<OwnershipScreenRouteProp>()
  const { machine, ownership } = route.params
  
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

  return (
    <View style={styles.container}>
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

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        bounces={true}
        alwaysBounceVertical={true}
        scrollEventThrottle={16}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={true}
        removeClippedSubviews={false}
      >
        <LinearGradient
          colors={['#0E0D0C', '#1A1A1A', '#0E0D0C']}
          style={styles.gradientContent}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Success Header */}
          <MotiView
            from={{ opacity: 0, translateY: -50 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{
              type: 'spring',
              damping: 15,
              stiffness: 100,
            }}
            style={styles.header}
          >
            <Text style={styles.successEmoji}>🎉</Text>
            <Text style={styles.title}>Congratulations!</Text>
            <Text style={styles.subtitle}>
              You now own a piece of {machine.name}
            </Text>
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
            <LinearGradient
              colors={GRADIENTS.machine as [string, string, string]}
              style={styles.cardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {/* Machine Image */}
              <View style={styles.machineImageContainer}>
                <Image source={{ uri: machine.image }} style={styles.machineImage} />
                <View style={styles.ownershipBadge}>
                  <Text style={styles.ownershipBadgeText}>OWNED</Text>
                </View>
              </View>

              {/* Ownership Details */}
              <View style={styles.ownershipDetails}>
                <Text style={styles.machineName}>{machine.name}</Text>
                <Text style={styles.machineType}>{machine.type}</Text>
                
                {/* Percentage Display */}
                <View style={styles.percentageContainer}>
                  <Text style={styles.percentageLabel}>Ownership</Text>
                  <Text style={styles.percentageValue}>
                    {animatedPercentage.toFixed(1)}%
                  </Text>
                </View>

                {/* Earnings Display */}
                <View style={styles.earningsContainer}>
                  <Text style={styles.earningsLabel}>Total Earnings</Text>
                  <Text style={styles.earningsValue}>
                    {ownership.earnings.toFixed(4)} PEAQ
                  </Text>
                </View>

                {/* Tokens Display */}
                <View style={styles.tokensContainer}>
                  <Text style={styles.tokensLabel}>Tokens Owned</Text>
                  <Text style={styles.tokensValue}>
                    {ownership.tokens.toLocaleString()} / {ownership.totalTokens.toLocaleString()}
                  </Text>
                </View>
              </View>
            </LinearGradient>
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
                <Text style={styles.primaryButtonText}>View Dashboard</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleBackToMachines}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Explore More Machines</Text>
            </TouchableOpacity>
          </MotiView>

          {/* Extra content to ensure scrolling */}
          <View style={styles.extraContent}>
            <Text style={styles.extraText}>🎉 Congratulations on your first machine ownership!</Text>
            <Text style={styles.extraText}>💰 Start earning passive income from autonomous machines</Text>
            <Text style={styles.extraText}>📈 Track your earnings in the dashboard</Text>
            <Text style={styles.extraText}>🔄 Explore more machines to diversify your portfolio</Text>
            <Text style={styles.extraText}>🚀 Join the machine economy revolution!</Text>
            <Text style={styles.extraText}>💎 Your fractional ownership is now live</Text>
          </View>
        </LinearGradient>
      </ScrollView>
    </View>
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
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  successEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    fontFamily: 'NB International Pro Bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#A7A6A5',
    textAlign: 'center',
    fontFamily: 'NB International Pro',
  },
  ownershipCard: {
    marginBottom: 32,
    borderRadius: 20,
    overflow: 'hidden',
    ...GLASSMORPHISM.shadow,
  },
  cardGradient: {
    padding: 24,
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
    paddingHorizontal: 20,
    paddingVertical: 30,
    backgroundColor: 'rgba(82, 82, 215, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(82, 82, 215, 0.1)',
  },
  extraText: {
    fontSize: 14,
    color: '#A7A6A5',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'NB International Pro',
    lineHeight: 20,
  },
})