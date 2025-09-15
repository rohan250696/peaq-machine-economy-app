import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Modal, Alert } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { MotiView } from 'moti'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { RootStackParamList, Machine, PaymentFlowStep } from '../types'
import { MACHINE_ACTIONS, GLASSMORPHISM, GRADIENTS, TOKEN_ADDRESS, PEAQ_MACHINE_MANAGER_ADDRESS, KWB_APP_WALLET_KEY, AGUNG_TESTNET_MACHINE_MANAGER_ADDRESS } from '../constants'
import * as Clipboard from 'expo-clipboard'
import { safeTruncateHash } from '../utils/safeSlice'
import { useTheme } from '../contexts/ThemeContext'
import { useMachineManager } from '../contexts/MachineManagerContext'
import { useAccount, useBalance } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { ethers } from "ethers"
import MachineManagerABI from '../abi/MachineManagerABI.json'
import ERC20ABI from '../abi/ERC20.json'

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
    useMachine, 
    isUsingMachine, 
    useMachineError,
    getTokenBalance,
    airdropPeaqToken,
    hasUsedMachine: checkHasUsedMachine
  } = useMachineManager()
  
  const [currentStep, setCurrentStep] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [transactionHash, setTransactionHash] = useState('')
  const [showModal, setShowModal] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [useMachineHash, setUseMachineHash] = useState<string>('')
  const [airdropHash, setAirdropHash] = useState<string>('')
  const [isAirdropping, setIsAirdropping] = useState(false)
  
  const actionInfo = MACHINE_ACTIONS[machine.type] || MACHINE_ACTIONS.RoboCafe // Fallback to RoboCafe if type not found
  // Use real machine price from contract data if available, otherwise fallback to action price
  const price = machine.price ? machine.price : actionInfo.price

  const privy = usePrivy();
  const { wallets } = useWallets();

  // Dynamic payment steps based on whether user has used machine before
  const [hasUsedMachine, setHasUsedMachine] = useState<boolean | null>(null)
  
  // Check if user has used machine on component mount
  useEffect(() => {
    const checkMachineUsage = async () => {
      if (address) {
        const used = await checkHasUsedMachine(machine.id, address)
        setHasUsedMachine(used)
      }
    }
    checkMachineUsage()
  }, [address, machine.id, checkHasUsedMachine])

  const paymentSteps: PaymentFlowStep[] = hasUsedMachine === false ? [
    // Steps for new users (with airdrop)
    {
      id: 'airdrop',
      title: 'Airdropping PEAQ tokens...',
      description: `Getting ${(parseFloat(price.toString()) + 0.01).toFixed(4)} PEAQ (${price} + 0.01 gas fee)`,
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
  ] : [
    // Steps for returning users (no airdrop)
    {
      id: 'using',
      title: 'Using machine...',
      description: 'Calling useMachine contract function',
      status: currentStep === 0 ? 'active' : currentStep > 0 ? 'completed' : 'pending'
    },
    {
      id: 'success',
      title: `You got your ${actionInfo.emoji} ${action}!`,
      description: 'Transaction completed successfully',
      status: currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : 'pending'
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
        
        // Check if user has already used this machine (from contract)
        const hasUsed = await checkHasUsedMachine(machine.id, address)
        
        if (!hasUsed) {
          // User hasn't used machine before - airdrop PEAQ tokens
          console.log('User eligible for airdrop, airdropping PEAQ tokens...')
          setIsAirdropping(true)
          setCurrentStep(0)

          const wallet = wallets[0];
          const ethereumProvider = await wallet.getEthereumProvider();
          const provider = new ethers.BrowserProvider(ethereumProvider);

          const kwbAppWallet = new ethers.Wallet(KWB_APP_WALLET_KEY, provider);
          const tokenContract = new ethers.Contract(TOKEN_ADDRESS, ERC20ABI, kwbAppWallet);
          const machinePriceNum = parseFloat(price.toString())
          const gasFeeNum = parseFloat('0.01')
          const totalAmount = (machinePriceNum + gasFeeNum).toString()
          const tx = await tokenContract.transfer(address, parseEther(totalAmount));
          await tx.wait();
          setAirdropHash(tx?.hash);
          console.log('Airdrop transaction hash:', tx?.hash)
          setCurrentStep(1)
          setIsAirdropping(false)
        } else {
          // User has used machine before - check balance and proceed directly
          console.log('User has already used this machine, checking balance...')
          
          // Check if user has sufficient balance
          const userBalance = balance ? parseFloat(formatEther(balance.value)) : 0
          const requiredAmount = parseFloat(price.toString())
          
          if (userBalance < requiredAmount) {
            setError(`Insufficient PEAQ balance. You need ${requiredAmount} PEAQ but only have ${userBalance.toFixed(4)} PEAQ`)
            return
          }
          
          console.log(`User has sufficient balance (${userBalance.toFixed(4)} PEAQ), proceeding with useMachine...`)
          setCurrentStep(0) // Skip airdrop step
        }
        
        // Step 1: Use machine
        console.log(`Using machine ${machine.id}`)
        
        const wallet = wallets[0];
        const ethereumProvider = await wallet.getEthereumProvider();
        const provider = new ethers.BrowserProvider(ethereumProvider);
        const signer = await provider.getSigner();

        const machineManager = new ethers.Contract(
          AGUNG_TESTNET_MACHINE_MANAGER_ADDRESS,
          MachineManagerABI,
          signer
        );
        
        const machineManagerTx = await machineManager.useMachine(machine.id, {value: parseEther(price.toString())});
        await machineManagerTx.wait();
        console.log('Use machine transaction hash:', machineManagerTx?.hash)
        setUseMachineHash(machineManagerTx?.hash)
        setTransactionHash(machineManagerTx?.hash)
        setCurrentStep(hasUsed ? 1 : 2) // Adjust step based on whether airdrop happened
        
        // Step 2: Success
        setIsCompleted(true)
        
        // Navigate to ownership screen after delay
        // setTimeout(() => {
        //   setShowModal(false)
        //   navigation.replace('Ownership', {
        //     machine,
        //     ownership: {
        //       machineId: machine.id,
        //       percentage: 0.1,
        //       tokens: 10,
        //       totalTokens: 1000,
        //       earnings: 0.05,
        //       lastEarning: new Date().toISOString()
        //     }
        //   })
        // }, 2000)
        
      } catch (error) {
        console.error('Payment process error:', error)
        setError(error instanceof Error ? error.message : 'Payment failed')
      }
    }

    processPayment()
  }, [machine, action, navigation, address, price, useMachine, checkHasUsedMachine, balance])

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

  const copyTransactionHash = async (hash?: string) => {
    const hashToCopy = hash || transactionHash
    if (!hashToCopy) return
    
    try {
      await Clipboard.setStringAsync(hashToCopy)
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
    navigationButton: {
      backgroundColor: colors.primary,
    },
    navigationButtonText: {
      color: colors.background,
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
                  
                  {/* Back Button - Only show when there's an error */}
                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.backButtonText}>← Go Back</Text>
                  </TouchableOpacity>
                </MotiView>
              )}

              {/* Transaction Hashes */}
              {(airdropHash || useMachineHash) && (
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
                    Transaction Hashes
                  </Text>
                  
                  {/* Airdrop Hash */}
                  {airdropHash && (
                    <View style={styles.transactionItem}>
                      <Text style={[styles.transactionType, dynamicStyles.progressText]}>Airdrop PEAQ:</Text>
                      <TouchableOpacity 
                        style={styles.transactionHash}
                        onPress={() => copyTransactionHash(airdropHash)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.transactionHashText, dynamicStyles.hashText]}>
                          {safeTruncateHash(airdropHash)}
                        </Text>
                        <Text style={[styles.transactionLink, dynamicStyles.buttonText]}>📋</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  
                  
                  {/* Use Machine Hash */}
                  {useMachineHash && (
                    <View style={styles.transactionItem}>
                      <Text style={[styles.transactionType, dynamicStyles.progressText]}>Use Machine:</Text>
                      <TouchableOpacity 
                        style={styles.transactionHash}
                        onPress={() => copyTransactionHash(useMachineHash)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.transactionHashText, dynamicStyles.hashText]}>
                          {safeTruncateHash(useMachineHash)}
                        </Text>
                        <Text style={[styles.transactionLink, dynamicStyles.buttonText]}>📋</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  
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
                  
                  {/* Navigation Button */}
                  <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{
                      type: 'timing',
                      duration: 500,
                      delay: 500,
                    }}
                    style={styles.navigationButtonContainer}
                  >
                    <TouchableOpacity
                      style={[styles.navigationButton, dynamicStyles.navigationButton]}
                      onPress={() => {
                        console.log('View Ownership Details button pressed')
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
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.navigationButtonText, dynamicStyles.navigationButtonText]}>
                        View Ownership Details →
                      </Text>
                    </TouchableOpacity>
                  </MotiView>
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
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'NB International Pro',
    fontWeight: '600',
    textAlign: 'center',
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
  transactionItem: {
    marginBottom: 12,
  },
  transactionType: {
    fontSize: 12,
    color: '#A7A6A5',
    marginBottom: 4,
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
    marginBottom: 20,
  },
  navigationButtonContainer: {
    marginTop: 20,
    zIndex: 10,
  },
  navigationButton: {
    backgroundColor: '#5252D7',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 220,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  navigationButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'NB International Pro Bold',
    textAlign: 'center',
  },
})
