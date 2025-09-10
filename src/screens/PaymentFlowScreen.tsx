import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Modal, Alert } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { MotiView } from 'moti'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { RootStackParamList, Machine, PaymentFlowStep } from '../types'
import { MACHINE_ACTIONS, GLASSMORPHISM, GRADIENTS } from '../constants'
import * as Clipboard from 'expo-clipboard'

const { width, height } = Dimensions.get('window')

type PaymentFlowScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PaymentFlow'>
type PaymentFlowScreenRouteProp = RouteProp<RootStackParamList, 'PaymentFlow'>

export default function PaymentFlowScreen() {
  const navigation = useNavigation<PaymentFlowScreenNavigationProp>()
  const route = useRoute<PaymentFlowScreenRouteProp>()
  const { machine, action } = route.params
  
  const [currentStep, setCurrentStep] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [transactionHash, setTransactionHash] = useState('')
  const [showModal, setShowModal] = useState(true)
  
  const actionInfo = MACHINE_ACTIONS[machine.type]
  const price = actionInfo.price

  const paymentSteps: PaymentFlowStep[] = [
    {
      id: 'preparing',
      title: 'Preparing payment...',
      description: 'Setting up your transaction',
      status: 'active'
    },
    {
      id: 'executing',
      title: 'Executing on-chain transaction...',
      description: 'Processing your payment',
      status: 'pending'
    },
    {
      id: 'success',
      title: `You got your ${actionInfo.emoji} ${action}!`,
      description: 'Transaction completed successfully',
      status: 'pending'
    }
  ]

  useEffect(() => {
    const processPayment = async () => {
      // Step 1: Preparing payment
      await new Promise(resolve => setTimeout(resolve, 2000))
      setCurrentStep(1)
      
      // Step 2: Executing transaction
      await new Promise(resolve => setTimeout(resolve, 3000))
      setCurrentStep(2)
      
      // Generate mock transaction hash
      setTransactionHash('0x' + Math.random().toString(16).substr(2, 64))
      
      // Step 3: Success
      await new Promise(resolve => setTimeout(resolve, 1500))
      setIsCompleted(true)
      
      // Navigate to ownership screen after delay
      setTimeout(() => {
        setShowModal(false)
        navigation.replace('Ownership', {
          machine,
          ownership: {
            machineId: machine.id,
            percentage: 0.1,
            tokens: 10,
            totalTokens: 1000,
            earnings: 0.05,
            lastEarning: new Date().toISOString()
          }
        })
      }, 2000)
    }

    processPayment()
  }, [machine, action, navigation])

  const getStepIcon = (stepIndex: number, status: string) => {
    if (status === 'completed') return '✅'
    if (status === 'active') return '⏳'
    if (status === 'error') return '❌'
    return '⏸️'
  }

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed': return '#06B6D4'
      case 'active': return '#8B5CF6'
      case 'error': return '#EF4444'
      default: return '#6B7280'
    }
  }

  const copyTransactionHash = async () => {
    if (!transactionHash) return
    
    try {
      await Clipboard.setStringAsync(transactionHash)
      Alert.alert('Copied!', 'Transaction hash copied to clipboard')
    } catch (error) {
      Alert.alert('Error', 'Failed to copy transaction hash')
    }
  }

  return (
    <LinearGradient
      colors={['#0E0D0C', '#1A1A1A', '#0E0D0C']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Background Content */}
      <View style={styles.backgroundContent}>
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.1, scale: 1 }}
          transition={{
            type: 'timing',
            duration: 3000,
            loop: true,
          }}
          style={styles.backgroundElement}
        />
        
        <View style={styles.content}>
          <Text style={styles.title}>Processing Payment</Text>
          <Text style={styles.subtitle}>
            {actionInfo.emoji} {action} from {machine.name}
          </Text>
        </View>
      </View>

      {/* Payment Modal */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <MotiView
            from={{ opacity: 0, scale: 0.8, translateY: 50 }}
            animate={{ opacity: 1, scale: 1, translateY: 0 }}
            transition={{
              type: 'spring',
              damping: 15,
              stiffness: 100,
            }}
            style={styles.modalContent}
          >
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.1)', 'rgba(6, 182, 212, 0.1)']}
              style={styles.modalGradient}
            >
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Payment in Progress</Text>
                <Text style={styles.modalSubtitle}>
                  {price} PEAQ • {machine.name}
                </Text>
              </View>

              {/* Payment Steps */}
              <View style={styles.stepsContainer}>
                {paymentSteps.map((step, index) => {
                  const isActive = index === currentStep
                  const isCompleted = index < currentStep
                  const isError = false // Could be implemented for error handling
                  
                  const status = isCompleted ? 'completed' : isActive ? 'active' : 'pending'
                  
                  return (
                    <MotiView
                      key={step.id}
                      from={{ opacity: 0, translateX: -20 }}
                      animate={{ opacity: 1, translateX: 0 }}
                      transition={{
                        type: 'timing',
                        duration: 500,
                        delay: index * 200,
                      }}
                      style={styles.stepContainer}
                    >
                      <View style={styles.stepContent}>
                        <View style={[
                          styles.stepIcon,
                          { backgroundColor: getStepColor(status) }
                        ]}>
                          <Text style={styles.stepIconText}>
                            {getStepIcon(index, status)}
                          </Text>
                        </View>
                        
                        <View style={styles.stepInfo}>
                          <Text style={[
                            styles.stepTitle,
                            { color: isActive || isCompleted ? '#FFFFFF' : '#6B7280' }
                          ]}>
                            {step.title}
                          </Text>
                          <Text style={styles.stepDescription}>
                            {step.description}
                          </Text>
                        </View>
                      </View>
                      
                      {/* Progress Line */}
                      {index < paymentSteps.length - 1 && (
                        <View style={[
                          styles.progressLine,
                          { backgroundColor: isCompleted ? '#10B981' : 'rgba(255, 255, 255, 0.1)' }
                        ]} />
                      )}
                    </MotiView>
                  )
                })}
              </View>

              {/* Transaction Hash */}
              {transactionHash && (
                <MotiView
                  from={{ opacity: 0, translateY: 20 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{
                    type: 'timing',
                    duration: 500,
                  }}
                  style={styles.transactionContainer}
                >
                  <Text style={styles.transactionLabel}>Transaction Hash</Text>
                  <TouchableOpacity 
                    style={styles.transactionHash}
                    onPress={copyTransactionHash}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.transactionHashText}>
                      {transactionHash.slice(0, 10)}...{transactionHash.slice(-8)}
                    </Text>
                    <Text style={styles.transactionLink}>📋 Copy Hash</Text>
                  </TouchableOpacity>
                </MotiView>
              )}

              {/* Success Animation */}
              {isCompleted && (
                <MotiView
                  from={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: 'spring',
                    damping: 15,
                    stiffness: 100,
                  }}
                  style={styles.successContainer}
                >
                  <Text style={styles.successEmoji}>🎉</Text>
                  <Text style={styles.successText}>Payment Successful!</Text>
                </MotiView>
              )}
            </LinearGradient>
          </MotiView>
        </View>
      </Modal>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  backgroundElement: {
    position: 'absolute',
    width: width * 1.5,
    height: height * 1.5,
    backgroundColor: '#5252D7',
    borderRadius: width * 0.75,
    top: -height * 0.3,
    right: -width * 0.3,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'NB International Pro Bold',
  },
  subtitle: {
    fontSize: 18,
    color: '#A7A6A5',
    textAlign: 'center',
    fontFamily: 'NB International Pro',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(14, 13, 12, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(82, 82, 215, 0.2)',
    ...GLASSMORPHISM.shadow,
  },
  modalGradient: {
    padding: 20,
    backgroundColor: 'rgba(82, 82, 215, 0.03)',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    fontFamily: 'NB International Pro Bold',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#5252D7',
    fontFamily: 'NB International Pro',
  },
  stepsContainer: {
    marginBottom: 24,
  },
  stepContainer: {
    marginBottom: 16,
  },
  stepContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: 'rgba(82, 82, 215, 0.3)',
  },
  stepIconText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: 'NB International Pro',
  },
  stepDescription: {
    fontSize: 14,
    color: '#A7A6A5',
    fontFamily: 'NB International Pro',
  },
  progressLine: {
    width: 2,
    height: 20,
    marginLeft: 19,
    marginTop: 8,
  },
  transactionContainer: {
    marginBottom: 24,
  },
  transactionLabel: {
    fontSize: 14,
    color: '#A7A6A5',
    marginBottom: 8,
    fontFamily: 'NB International Pro',
  },
  transactionHash: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionHashText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'NB International Pro',
  },
  transactionLink: {
    fontSize: 12,
    color: '#5252D7',
    fontFamily: 'NB International Pro',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  successEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  successText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1D8359',
    fontFamily: 'NB International Pro Bold',
  },
})
