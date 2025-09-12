import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Modal, Alert } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { MotiView } from 'moti'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { RootStackParamList, Machine, PaymentFlowStep } from '../types'
import { MACHINE_ACTIONS, GLASSMORPHISM, GRADIENTS } from '../constants'
import * as Clipboard from 'expo-clipboard'
import { safeTruncateHash } from '../utils/safeSlice'
import { useTheme } from '../contexts/ThemeContext'
import { useMachineManager } from '../contexts/MachineManagerContext'
import { useAccount, useBalance } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { usePrivy } from '@privy-io/react-auth'

const { width, height } = Dimensions.get('window')

type PaymentFlowScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PaymentFlow'>
type PaymentFlowScreenRouteProp = RouteProp<RootStackParamList, 'PaymentFlow'>

export default function PaymentFlowScreen() {
  const navigation = useNavigation<PaymentFlowScreenNavigationProp>()
  const route = useRoute<PaymentFlowScreenRouteProp>()
  const { machine, action } = route.params
  const { colors } = useTheme()
  
  // Wagmi and contract context
  const { address } = useAccount()
  const { data: balance } = useBalance({ address })
  const { 
    approveToken, 
    useMachine, 
    isApproving, 
    isUsingMachine, 
    approveError, 
    useMachineError,
    interactWithMachine,
    getTokenBalance
  } = useMachineManager()
  
  const [currentStep, setCurrentStep] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [transactionHash, setTransactionHash] = useState('')
  const [showModal, setShowModal] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [approveHash, setApproveHash] = useState<string>('')
  const [useMachineHash, setUseMachineHash] = useState<string>('')
  
  const actionInfo = MACHINE_ACTIONS[machine.type]
  // Use real machine price from contract data if available, otherwise fallback to action price
  const price = machine.price ? machine.price : actionInfo.price

  const privy = usePrivy();

  const paymentSteps: PaymentFlowStep[] = [
    {
      id: 'approving',
      title: 'Approving PEAQ tokens...',
      description: `Approving ${price} PEAQ for machine interaction`,
      status: currentStep === 0 ? 'active' : currentStep > 0 ? 'completed' : 'pending'
    },
    {
      id: 'using',
      title: 'Using machine...',
      description: 'Calling useMachine contract function',
      status: currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : 'pending'
    },
    {
      id: 'success',
      title: `You got your ${actionInfo.emoji} ${action}!`,
      description: 'Transaction completed successfully',
      status: currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : 'pending'
    }
  ]

  useEffect(() => {
    const processPayment = async () => {
      if (!address) {
        setError('No wallet connected')
        return
      }

      try {
        setError(null)
        
        // Check PEAQ token balance before proceeding
        console.log(`Checking PEAQ balance for user ${address}`)
        const peaqBalance = await getTokenBalance(address)
        const requiredAmount = parseFloat(price.toString())
        const userBalance = parseFloat(peaqBalance)
        
        console.log(`Required: ${requiredAmount} PEAQ, User has: ${userBalance} PEAQ`)
        
        if (userBalance < requiredAmount) {
          setError(`Insufficient PEAQ balance. You have ${userBalance.toFixed(4)} PEAQ but need ${requiredAmount} PEAQ`)
          return
        }
        
        // Step 1: Approve PEAQ tokens
        console.log(`Approving ${price} PEAQ tokens for machine ${machine.id}`)
        const provider = await privy.getAccessToken;
        const approveHash = await approveToken(address, price.toString())
        if (approveHash) {
          setApproveHash(approveHash)
          console.log('Approve transaction hash:', approveHash)
        }
        setCurrentStep(1)
        
        // Step 2: Use machine
        console.log(`Using machine ${machine.id}`)
        const useMachineHash = await useMachine(machine.id)
        if (useMachineHash) {
          setUseMachineHash(useMachineHash)
          setTransactionHash(useMachineHash) // Set the final transaction hash
          console.log('Use machine transaction hash:', useMachineHash)
        }
        setCurrentStep(2)
        
        // Step 3: Success
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
        
      } catch (error) {
        console.error('Payment process error:', error)
        setError(error instanceof Error ? error.message : 'Payment failed')
      }
    }

    processPayment()
  }, [machine, action, navigation, address, price, approveToken, useMachine])

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
    modalBackground: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    stepTitle: {
      color: colors.text,
    },
    stepDescription: {
      color: colors.textSecondary,
    },
    machineName: {
      color: colors.text,
    },
    machineType: {
      color: colors.textSecondary,
    },
    priceText: {
      color: colors.primary,
    },
    actionText: {
      color: colors.text,
    },
    progressText: {
      color: colors.textSecondary,
    },
    successText: {
      color: colors.success,
    },
    hashText: {
      color: colors.textSecondary,
    },
    buttonText: {
      color: colors.text,
    },
    closeButtonText: {
      color: colors.text,
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
          <Text style={dynamicStyles.title}>Processing Payment</Text>
          <Text style={dynamicStyles.subtitle}>
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
            <View style={[styles.modalGradient, dynamicStyles.modalBackground]}>
              {/* Modern Modal Header */}
              <View style={styles.modernModalHeader}>
                <View style={styles.headerIcon}>
                  <Text style={styles.headerEmoji}>{actionInfo.emoji}</Text>
                </View>
                <View style={styles.headerContent}>
                  <Text 
                    style={[styles.modalTitle, dynamicStyles.stepTitle]} 
                    numberOfLines={1}
                    adjustsFontSizeToFit={true}
                  >
                    Payment in Progress
                  </Text>
                  <Text 
                    style={[styles.modalSubtitle, dynamicStyles.machineName]}
                    numberOfLines={1}
                    adjustsFontSizeToFit={true}
                  >
                    {machine.name} • {machine.type}
                  </Text>
                  <View style={styles.priceContainer}>
                    <Text 
                      style={[styles.priceLabel, dynamicStyles.progressText]}
                      numberOfLines={1}
                      adjustsFontSizeToFit={true}
                    >
                      Amount:
                    </Text>
                    <Text 
                      style={[styles.priceValue, dynamicStyles.priceText]}
                      numberOfLines={1}
                      adjustsFontSizeToFit={true}
                    >
                      {price} PEAQ
                    </Text>
                  </View>
                </View>
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
                          <Text 
                            style={[
                              styles.stepTitle,
                              dynamicStyles.stepTitle,
                              { color: isActive || isCompleted ? colors.text : colors.textSecondary }
                            ]}
                            numberOfLines={2}
                            adjustsFontSizeToFit={true}
                          >
                            {step.title}
                          </Text>
                          <Text 
                            style={[
                              styles.stepDescription,
                              dynamicStyles.stepDescription
                            ]}
                            numberOfLines={2}
                            adjustsFontSizeToFit={true}
                          >
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

              {/* Error Display */}
              {error && (
                <MotiView
                  from={{ opacity: 0, translateY: 20 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{
                    type: 'timing',
                    duration: 500,
                  }}
                  style={styles.errorContainer}
                >
                  <Text style={[styles.errorText, { color: '#EF4444' }]}>
                    ❌ {error}
                  </Text>
                </MotiView>
              )}

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
                  <Text 
                    style={[styles.transactionLabel, dynamicStyles.progressText]}
                    numberOfLines={1}
                    adjustsFontSizeToFit={true}
                  >
                    Transaction Hash
                  </Text>
                  <TouchableOpacity 
                    style={styles.transactionHash}
                    onPress={copyTransactionHash}
                    activeOpacity={0.7}
                  >
                    <Text 
                      style={[styles.transactionHashText, dynamicStyles.hashText]}
                      numberOfLines={1}
                      adjustsFontSizeToFit={true}
                    >
                      {(() => {
                        // Debug logging
                        console.log('PaymentFlowScreen - transactionHash:', transactionHash, 'type:', typeof transactionHash, 'length:', transactionHash?.length);
                        
                        return safeTruncateHash(transactionHash);
                      })()}
                    </Text>
                    <Text 
                      style={[styles.transactionLink, dynamicStyles.buttonText]}
                      numberOfLines={1}
                      adjustsFontSizeToFit={true}
                    >
                      📋 Copy Hash
                    </Text>
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
                  <Text 
                    style={[styles.successText, dynamicStyles.successText]}
                    numberOfLines={1}
                    adjustsFontSizeToFit={true}
                  >
                    Payment Successful!
                  </Text>
                </MotiView>
              )}
            </View>
          </MotiView>
        </View>
      </Modal>
    </div>
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
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'NB International Pro Bold',
  },
  subtitle: {
    fontSize: 18,
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
    minWidth: 320,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(14, 13, 12, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(82, 82, 215, 0.2)',
    ...GLASSMORPHISM.shadow,
  },
  modalGradient: {
    padding: 24,
    backgroundColor: 'rgba(82, 82, 215, 0.03)',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  modernModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(82, 82, 215, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: 'rgba(82, 82, 215, 0.3)',
  },
  headerEmoji: {
    fontSize: 28,
  },
  headerContent: {
    flex: 1,
    gap: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  priceLabel: {
    fontSize: 12,
    fontFamily: 'NB International Pro',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'NB International Pro Bold',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'NB International Pro Bold',
  },
  modalSubtitle: {
    fontSize: 14,
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
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: 'NB International Pro',
  },
  stepDescription: {
    fontSize: 12,
    fontFamily: 'NB International Pro',
  },
  errorContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'NB International Pro',
    textAlign: 'center',
    fontWeight: '500',
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
