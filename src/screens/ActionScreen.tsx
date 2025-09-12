import React, { useState } from 'react'
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image, ScrollView } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { MotiView } from 'moti'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { RootStackParamList, Machine } from '../types'
import { MACHINE_ACTIONS, GLASSMORPHISM, GRADIENTS } from '../constants'
import { scaleWidth, scaleHeight, spacing, fontSizes, safeAreaPadding, layout, responsive } from '../utils/responsive'
import { safeTruncateAddress } from '../utils/safeSlice'

const { width, height } = Dimensions.get('window')

type ActionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Action'>
type ActionScreenRouteProp = RouteProp<RootStackParamList, 'Action'>

export default function ActionScreen() {
  const navigation = useNavigation<ActionScreenNavigationProp>()
  const route = useRoute<ActionScreenRouteProp>()
  const { machine } = route.params
  
  const [isProcessing, setIsProcessing] = useState(false)
  
  const action = MACHINE_ACTIONS[machine.type]
  const price = action.price

  const handleActionPress = async () => {
    setIsProcessing(true)
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Navigate to payment flow
    navigation.navigate('PaymentFlow', { 
      machine, 
      action: action.action 
    })
    
    setIsProcessing(false)
  }

  const truncateAddress = (address: string) => {
    return safeTruncateAddress(address);
  }

  return (
    <div style={{
      height: '100vh',
      backgroundColor: '#0E0D0C',
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch'
    }}>
        {/* Header */}
        <MotiView
          from={{ opacity: 0, translateY: -30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'timing',
            duration: 800,
          }}
          style={[styles.header, { paddingTop: responsive(90, 100, 110) }]}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          
          <Text style={styles.title}>{machine.name}</Text>
          <Text style={styles.subtitle}>{machine.type}</Text>
        </MotiView>

        {/* Machine Image */}
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            type: 'spring',
            damping: 15,
            stiffness: 100,
            delay: 200,
          }}
          style={styles.imageContainer}
        >
          <Image source={{ uri: machine.image }} style={styles.machineImage} />
          <View style={styles.statusBadge}>
            <View style={[
              styles.statusDot,
              { backgroundColor: machine.isActive ? '#10B981' : '#EF4444' }
            ]} />
            <Text style={styles.statusText}>
              {machine.isActive ? 'Active' : 'Offline'}
            </Text>
          </View>
        </MotiView>

        {/* Machine Details */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'timing',
            duration: 800,
            delay: 400,
          }}
          style={styles.detailsContainer}
        >
          <View style={styles.detailsCard}>
            <Text style={styles.detailsTitle}>Machine Details</Text>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Address</Text>
              <Text style={styles.detailValue}>{truncateAddress(machine.address)}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Live Revenue</Text>
              <Text style={styles.detailValue}>{machine.revenue.toFixed(2)} PEAQ</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Total Revenue</Text>
              <Text style={styles.detailValue}>{machine.totalRevenue.toFixed(2)} PEAQ</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailValue}>
                {machine.location.lat.toFixed(2)}, {machine.location.lng.toFixed(2)}
              </Text>
            </View>
          </View>
        </MotiView>

        {/* Action Section */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'timing',
            duration: 800,
            delay: 600,
          }}
          style={styles.actionContainer}
        >
          <View style={styles.actionCard}>
            <Text style={styles.actionTitle}>Available Action</Text>
            
            <View style={styles.actionInfo}>
              <Text style={styles.actionEmoji}>{action.emoji}</Text>
              <Text style={styles.actionName}>{action.action}</Text>
              <Text style={styles.actionDescription}>{action.description}</Text>
            </View>

            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Price</Text>
              <Text style={styles.priceAmount}>{price} PEAQ</Text>
            </View>
          </View>
        </MotiView>

        {/* Action Button */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'timing',
            duration: 800,
            delay: 800,
          }}
          style={styles.buttonContainer}
        >
          <TouchableOpacity
            style={[
              styles.actionButton,
              isProcessing && styles.actionButtonDisabled
            ]}
            onPress={handleActionPress}
            disabled={isProcessing || !machine.isActive}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={machine.isActive ? (GRADIENTS.primary as [string, string]) : ['#6B7280', '#4B5563']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <MotiView
                from={{ scale: 1 }}
                animate={{ scale: isProcessing ? [1, 1.05, 1] : 1 }}
                transition={{
                  type: 'timing',
                  duration: 1000,
                  loop: isProcessing,
                }}
              >
                <Text style={styles.buttonEmoji}>{action.emoji}</Text>
                <Text style={styles.buttonText}>
                  {isProcessing ? 'Processing...' : action.action}
                </Text>
                <Text style={styles.buttonSubtext}>
                  Pay with PEAQ (airdrop ready)
                </Text>
              </MotiView>
            </LinearGradient>
          </TouchableOpacity>
        </MotiView>

        {/* Benefits Section */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'timing',
            duration: 800,
            delay: 1000,
          }}
          style={styles.benefitsContainer}
        >
          <View style={styles.benefitsCard}>
            <Text style={styles.benefitsTitle}>Why Use This Machine?</Text>
            
            <View style={styles.benefitItem}>
              <Text style={styles.benefitEmoji}>💰</Text>
              <Text style={styles.benefitText}>Earn fractional ownership</Text>
            </View>
            
            <View style={styles.benefitItem}>
              <Text style={styles.benefitEmoji}>📈</Text>
              <Text style={styles.benefitText}>Receive profit sharing</Text>
            </View>
            
            <View style={styles.benefitItem}>
              <Text style={styles.benefitEmoji}>🌍</Text>
              <Text style={styles.benefitText}>Support sustainable automation</Text>
            </View>
          </View>
        </MotiView>
    </div>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: safeAreaPadding.bottom + spacing.xl,
  },
  header: {
    paddingTop: safeAreaPadding.top,
    paddingHorizontal: safeAreaPadding.horizontal,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: safeAreaPadding.horizontal,
    top: safeAreaPadding.top,
    padding: spacing.sm,
  },
  backButtonText: {
    color: '#5252D7',
    fontSize: 16,
    fontFamily: 'NB International Pro',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'NB International Pro Bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#5252D7',
    textAlign: 'center',
    fontFamily: 'NB International Pro',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  machineImage: {
    width: '100%',
    height: responsive(200, 250),
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  statusBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter',
  },
  detailsContainer: {
    paddingHorizontal: safeAreaPadding.horizontal,
    marginBottom: spacing.lg,
  },
  detailsCard: {
    backgroundColor: GLASSMORPHISM.background,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: GLASSMORPHISM.border,
    ...GLASSMORPHISM.shadow,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    fontFamily: 'NB International Pro Bold',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  detailLabel: {
    fontSize: 14,
    color: '#A7A6A5',
    fontFamily: 'NB International Pro',
  },
  detailValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    fontFamily: 'NB International Pro',
  },
  actionContainer: {
    paddingHorizontal: safeAreaPadding.horizontal,
    marginBottom: spacing.lg,
  },
  actionCard: {
    backgroundColor: GLASSMORPHISM.background,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: GLASSMORPHISM.border,
    alignItems: 'center',
    ...GLASSMORPHISM.shadow,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    fontFamily: 'NB International Pro Bold',
  },
  actionInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  actionEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  actionName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    fontFamily: 'NB International Pro Bold',
  },
  actionDescription: {
    fontSize: 14,
    color: '#A7A6A5',
    textAlign: 'center',
    fontFamily: 'NB International Pro',
  },
  priceContainer: {
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 12,
    color: '#A7A6A5',
    marginBottom: 4,
    fontFamily: 'NB International Pro',
  },
  priceAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#5252D7',
    fontFamily: 'NB International Pro Bold',
  },
  buttonContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  actionButton: {
    borderRadius: 20,
    overflow: 'hidden',
    ...GLASSMORPHISM.shadow,
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  buttonEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    fontFamily: 'NB International Pro Bold',
  },
  buttonSubtext: {
    fontSize: 14,
    color: '#A7A6A5',
    fontFamily: 'NB International Pro',
  },
  benefitsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  benefitsCard: {
    backgroundColor: GLASSMORPHISM.background,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: GLASSMORPHISM.border,
    ...GLASSMORPHISM.shadow,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    fontFamily: 'NB International Pro Bold',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  benefitEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  benefitText: {
    fontSize: 14,
    color: '#A7A6A5',
    fontFamily: 'NB International Pro',
  },
})
