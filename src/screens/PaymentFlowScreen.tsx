import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Modal,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList, Machine, PaymentFlowStep } from "../types";
import {
  MACHINE_ACTIONS,
  GLASSMORPHISM,
  GRADIENTS,
  ADDRESS,
  CURRENT_CHAIN,
} from "../constants";
import * as Clipboard from "expo-clipboard";
import { safeTruncateHash } from "../utils/safeSlice";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";
import { responsive } from "../utils/responsive";
import { SvgXml } from 'react-native-svg';
import {
  useAirdropClaimed,
  useMachineManager,
} from "../contexts/MachineManagerContext";
import { useAccount, useBalance, useChainId } from "wagmi";
import { parseEther, formatEther } from "viem";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { ethers } from "ethers";
import MachineManagerABI from "../abi/MachineManagerABI.json";
import ERC20ABI from "../abi/ERC20.json";
import { KBW_APP_WALLET_KEY } from '@env';

const { width, height } = Dimensions.get("window");

// External link SVG icon
const externalLinkSvg = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 8.66667V12.6667C12 13.0203 11.8595 13.3594 11.6095 13.6095C11.3594 13.8595 11.0203 14 10.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V5.33333C2 4.97971 2.14048 4.64057 2.39052 4.39052C2.64057 4.14048 2.97971 4 3.33333 4H7.33333" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M10 2H14V6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M6.66669 9.33333L14 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// Helper function to create structured error messages
const createError = (
  type: "wallet" | "balance" | "network" | "transaction" | "unknown",
  rawError: string | Error,
  t?: (key: any) => string
) => {
  const errorMessage = rawError instanceof Error ? rawError.message : rawError;

  switch (type) {
    case "wallet":
      return {
        type: "wallet" as const,
        title: t ? t('payment.error') : "Wallet Connection Required",
        message: t ? t('payment.walletRequired') : "Please connect your wallet to continue with the payment.",
        action: t ? t('payment.connectWallet') : "Connect Wallet",
      };

    case "balance":
      const balanceMatch = errorMessage.match(
        /You need ([\d.]+) peaq but only have ([\d.]+) peaq/
      );
      if (balanceMatch) {
        const needed = balanceMatch[1];
        const current = balanceMatch[2];
        return {
          type: "balance" as const,
          title: t ? t('payment.error') : "Insufficient peaq Balance",
          message: t ? t('payment.insufficientBalance') : `You need ${needed} peaq to complete this transaction, but your current balance is ${current} peaq.`,
          action: t ? t('payment.getMorePeaq') : "Get More peaq",
        };
      }
      return {
        type: "balance" as const,
        title: t ? t('payment.error') : "Insufficient Balance",
        message: t ? t('payment.insufficientBalance') : "Your wallet doesn't have enough peaq tokens for this transaction.",
        action: t ? t('payment.checkBalance') : "Check Balance",
      };

    case "network":
      return {
        type: "network" as const,
        title: t ? t('payment.error') : "Network Connection Issue",
        message: t ? t('payment.networkError') : "Unable to connect to the peaq network. Please check your internet connection and try again.",
        action: t ? t('payment.retryConnection') : "Retry Connection",
      };

    case "transaction":
      if (errorMessage.includes("user rejected")) {
        return {
          type: "transaction" as const,
          title: t ? t('payment.cancelled') : "Transaction Cancelled",
          message: t ? t('payment.cancelledMessage') : "You cancelled the transaction. No charges have been made.",
          action: t ? t('payment.tryAgain') : "Try Again",
        };
      }
      if (errorMessage.includes("gas")) {
        return {
          type: "transaction" as const,
          title: t ? t('payment.error') : "Gas Fee Issue",
          message: t ? t('payment.gasFeeError') : "There was an issue with the gas fee estimation. Please try again or adjust your gas settings.",
          action: t ? t('payment.retryPayment') : "Retry Payment",
        };
      }
      return {
        type: "transaction" as const,
        title: t ? t('payment.error') : "Transaction Failed",
        message: t ? t('payment.transactionFailed') : "The blockchain transaction failed. Your funds are safe and no charges were made.",
        action: t ? t('payment.tryAgain') : "Try Again",
      };

    default:
      return {
        type: "unknown" as const,
        title: t ? t('payment.error') : "Something Went Wrong",
        message: t ? t('payment.unexpectedError') : errorMessage || "An unexpected error occurred. Please try again.",
        action: t ? t('common.retry') : "Retry",
      };
  }
};

type PaymentFlowScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "PaymentFlow"
>;
type PaymentFlowScreenRouteProp = RouteProp<RootStackParamList, "PaymentFlow">;

export default function PaymentFlowScreen() {
  const navigation = useNavigation<PaymentFlowScreenNavigationProp>();
  const route = useRoute<PaymentFlowScreenRouteProp>();
  const { machine, action } = route.params;
  const { colors } = useTheme();
  const { t } = useLanguage();
  
  // Wagmi and contract context
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });
  const chainId = useChainId();
  const { 
    useMachine, 
  } = useMachineManager();

  //console.log("machine.id", machine.id, address as string);


  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [transactionHash, setTransactionHash] = useState("");
  const [showModal, setShowModal] = useState(true);
  const [error, setError] = useState<{
    type: "wallet" | "balance" | "network" | "transaction" | "unknown";
    title: string;
    message: string;
    action?: string;
  } | null>(null);
  const [useMachineHash, setUseMachineHash] = useState<string>("");
  const [airdropHash, setAirdropHash] = useState<string>("");
  const [isAirdropping, setIsAirdropping] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const [modalHeight, setModalHeight] = useState(0);
  const [needsScrolling, setNeedsScrolling] = useState(false);
  const [airdropClaimed, setAirdropClaimed] = useState(false);
  const [isLoadingAirdropStatus, setIsLoadingAirdropStatus] = useState(true);
  const [hasProcessedPayment, setHasProcessedPayment] = useState(false);
  const [userCancelled, setUserCancelled] = useState(false);

  const actionInfo = MACHINE_ACTIONS[machine.type] || MACHINE_ACTIONS.RoboCafe; // Fallback to RoboCafe if type not found
  // Use real machine price from contract data if available, otherwise fallback to action price
  const price = machine.price ? machine.price : actionInfo.price;

  const privy = usePrivy();
  const { wallets } = useWallets();

  // Dynamic payment steps based on whether user has claimed airdrop before
  
  // Calculate if scrolling is needed based on content and modal height
  useEffect(() => {
    if (contentHeight > 0 && modalHeight > 0) {
      const maxModalHeight = height * 0.85; // 85% of screen height
      const headerHeight = responsive(80, 100, 120); // Header space
      const paddingSpace = responsive(40, 48, 56); // Total padding
      const availableHeight = maxModalHeight - headerHeight - paddingSpace;
      
      const shouldScroll = contentHeight > availableHeight;
      
      // console.log('Scroll calculation:', {
      //   contentHeight,
      //   modalHeight,
      //   maxModalHeight,
      //   availableHeight,
      //   shouldScroll,
      //   screenHeight: height
      // });
      
      // Only enable scrolling if content significantly exceeds available space
      const scrollThreshold = responsive(60, 80, 100); // Responsive threshold
      const needsScroll = shouldScroll && (contentHeight > availableHeight + scrollThreshold);
      
      // console.log('Final scroll decision:', {
      //   needsScroll,
      //   threshold: scrollThreshold,
      //   contentExcess: contentHeight - availableHeight
      // });
      
      setNeedsScrolling(needsScroll);
    } else {
      // Default to no scrolling if measurements aren't ready
      setNeedsScrolling(false);
    }
  }, [contentHeight, modalHeight, height]);

  const paymentSteps: PaymentFlowStep[] = !airdropClaimed
    ? [
    // Steps for new users (with airdrop)
    {
          id: "airdrop",
          title: t('payment.airdropping'),
          description: `${t('payment.getting')} ${(parseFloat(price.toString()) + 0.01).toFixed(
            4
          )} peaq (${price} + 0.01 ${t('payment.gasFee')})`,
          status:
            currentStep === 0
              ? "active"
              : currentStep > 0
              ? "completed"
              : "pending",
        },
        {
          id: "using",
          title: t('payment.usingMachine'),
          description: t('payment.callingContract'),
          status:
            currentStep === 1
              ? "active"
              : currentStep > 1
              ? "completed"
              : "pending",
        },
        {
          id: "success",
      title: `${t('payment.gotYour')} ${actionInfo.emoji} ${action}!`,
          description: t('payment.completedSuccessfully'),
          status:
            currentStep === 2
              ? "active"
              : currentStep > 2
              ? "completed"
              : "pending",
        },
      ]
    : [
    // Steps for returning users (no airdrop)
    {
          id: "using",
          title: t('payment.usingMachine'),
          description: t('payment.callingContract'),
          status:
            currentStep === 0
              ? "active"
              : currentStep > 0
              ? "completed"
              : "pending",
        },
        {
          id: "success",
      title: `${t('payment.gotYour')} ${actionInfo.emoji} ${action}!`,
          description: t('payment.completedSuccessfully'),
          status:
            currentStep === 1
              ? "active"
              : currentStep > 1
              ? "completed"
              : "pending",
        },
      ];

  useEffect(() => {
    const processPayment = async () => {
      if (!address) {
        setError(createError("wallet", "No wallet connected", t));
        return;
      }

      // Prevent re-execution if payment has already been processed or user cancelled
      if (hasProcessedPayment || userCancelled) {
        return;
      }

      try {
        setError(null);
        //console.log("KBW_APP_WALLET_KEY", KBW_APP_WALLET_KEY);
          const wallet = wallets[0];
          const ethereumProvider = await wallet.getEthereumProvider();
          const provider = new ethers.BrowserProvider(ethereumProvider);

        const contractNew = new ethers.Contract(
          ADDRESS[CURRENT_CHAIN].MACHINE_MANAGER,
          MachineManagerABI,
          provider
        );
    const hasClaimedAirdrop = await contractNew.airdropClaimed(
          machine.id,
          address
        ) as unknown as boolean;
        //console.log("hasClaimedAirdrop", hasClaimedAirdrop);
        setAirdropClaimed(hasClaimedAirdrop);
        setIsLoadingAirdropStatus(false);
        setHasProcessedPayment(true); // Mark as processed to prevent re-execution

        // Step 1: Airdrop (if needed)
        if (!hasClaimedAirdrop) {
          try {
            console.log("User eligible for airdrop, airdropping peaq tokens...");
            setIsAirdropping(true);
            setCurrentStep(0);

          const kwbAppWallet = new ethers.Wallet(KBW_APP_WALLET_KEY, provider);
            const machineManagerContract = new ethers.Contract(
              ADDRESS[CURRENT_CHAIN].MACHINE_MANAGER,
              MachineManagerABI,
              kwbAppWallet
            );
            
            const airdropTx = await machineManagerContract.airdrop(address, machine.id);
            await airdropTx.wait();
            
            setAirdropHash(airdropTx?.hash);
            console.log("Airdrop transaction hash:", airdropTx?.hash);
            setCurrentStep(1);
            setIsAirdropping(false);
          } catch (airdropError) {
            console.error("Airdrop failed:", airdropError);
            setIsAirdropping(false);
            
            // Check if user rejected the airdrop transaction
            const errorMessage = airdropError instanceof Error ? airdropError.message : String(airdropError);
            if (errorMessage.includes('user rejected') || errorMessage.includes('ACTION_REJECTED') || errorMessage.includes('ethers-user-denied')) {
              console.log('User cancelled airdrop, stopping payment flow');
              setUserCancelled(true);
              setError(createError('transaction', 'You cancelled the airdrop transaction. No charges have been made.', t));
              return;
            }
            
            throw new Error(`Airdrop failed: ${errorMessage}`);
          }
        } else {
          // User has used machine before - check balance and proceed directly
          console.log("User has already used this machine, checking balance...");
          
          // Check if user has sufficient balance
          const userBalance = balance ? parseFloat(formatEther(balance.value)) : 0;
          const requiredAmount = parseFloat(price.toString());
          
          if (userBalance < requiredAmount) {
            setError(
              createError(
                "balance",
                `Insufficient peaq balance. You need ${requiredAmount} peaq but only have ${userBalance.toFixed(4)} peaq`,
                t
              )
            );
            return; // Stop execution here
          }

          console.log(`User has sufficient balance (${userBalance.toFixed(4)} peaq), proceeding with useMachine...`);
          setCurrentStep(0); // Skip airdrop step
        }

        // Step 2: Use machine (only proceed if previous steps succeeded)
        try {
          console.log(`Using machine ${machine.id}`);
          
        const signer = await provider.getSigner();
        const machineManager = new ethers.Contract(
          ADDRESS[CURRENT_CHAIN].MACHINE_MANAGER,
          MachineManagerABI,
          signer
        );
        
          const machineManagerTx = await machineManager.useMachine(machine.id, {
            value: parseEther(price.toString()),
          });
          
        await machineManagerTx.wait();
          
          console.log("Use machine transaction hash:", machineManagerTx?.hash);
          setUseMachineHash(machineManagerTx?.hash);
          setTransactionHash(machineManagerTx?.hash);
          setCurrentStep(hasClaimedAirdrop ? 1 : 2); // Adjust step based on whether airdrop happened
        } catch (useMachineError) {
          console.error("Use machine failed:", useMachineError);
          
          // Check if user rejected the transaction
          const errorMessage = useMachineError instanceof Error ? useMachineError.message : String(useMachineError);
          if (errorMessage.includes('user rejected') || errorMessage.includes('ACTION_REJECTED') || errorMessage.includes('ethers-user-denied')) {
            console.log('User cancelled transaction, stopping payment flow');
            setUserCancelled(true);
            // Don't throw error for user cancellation, just stop the flow
            setError(createError('transaction', 'You cancelled the transaction. No charges have been made.', t));
            return;
          }
          
          throw new Error(`Machine usage failed: ${errorMessage}`);
        }

        // Step 3: Success (only if all previous steps succeeded)
        setIsCompleted(true);
        console.log("Payment process completed successfully");
      } catch (error) {
        console.error("Payment process error:", error);

        // Determine error type based on error message
        const errorMessage =
          error instanceof Error ? error.message : "Payment failed";
        let errorType:
          | "wallet"
          | "balance"
          | "network"
          | "transaction"
          | "unknown" = "unknown";

        if (
          errorMessage.includes("user rejected") ||
          errorMessage.includes("denied")
        ) {
          errorType = "transaction";
        } else if (
          errorMessage.includes("insufficient") ||
          errorMessage.includes("balance")
        ) {
          errorType = "balance";
        } else if (
          errorMessage.includes("network") ||
          errorMessage.includes("connection")
        ) {
          // Only show network errors if not connected to peaq networks
          if (chainId !== 3338 && chainId !== 9990) {
            errorType = "network";
          } else {
            errorType = "transaction"; // Treat as transaction error if on correct network
          }
        } else if (
          errorMessage.includes("gas") ||
          errorMessage.includes("transaction")
        ) {
          errorType = "transaction";
        } else if (errorMessage.includes("Airdrop failed")) {
          errorType = "transaction";
        } else if (errorMessage.includes("Machine usage failed")) {
          errorType = "transaction";
        }

        // Reset all loading states on error
        setIsAirdropping(false);
        setIsLoadingAirdropStatus(false);
        setHasProcessedPayment(false); // Allow retry on error

        setError(
          createError(
            errorType,
            error instanceof Error ? error : new Error(String(error)),
            t
          )
        );
        
        // Log the step where the error occurred
        console.error(`Payment failed at step ${currentStep}:`, errorMessage);
        return;
      }
    };

    processPayment();
  }, [
    machine,
    action,
    address,
    price,
    balance,
    hasProcessedPayment,
    userCancelled,
    wallets
  ]);

  const getStepIcon = (stepIndex: number, status: string) => {
    if (status === "completed") return "✅";
    if (status === "active") return "⏳";
    if (status === "error") return "❌";
    return "⏸️";
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case "completed":
        return "#06B6D4";
      case "active":
        return "#8B5CF6";
      case "error":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const getExplorerUrl = (hash: string) => {
    const baseUrl = chainId === 9990 
      ? "https://agung-testnet.subscan.io/tx/" 
      : "https://peaq.subscan.io/tx/";
    return `${baseUrl}${hash}`;
  };

  const openTransactionInExplorer = (hash?: string) => {
    const hashToOpen = hash || transactionHash;
    if (!hashToOpen) return;
    
    const explorerUrl = getExplorerUrl(hashToOpen);
    
    if (Platform.OS === 'web') {
      // Open in new tab for web
      window.open(explorerUrl, '_blank', 'noopener,noreferrer');
    } else {
      // For mobile, we could use Linking.openURL
      // Linking.openURL(explorerUrl);
      console.log('Explorer URL:', explorerUrl);
    }
  };

  // Create dynamic styles based on theme
  const dynamicStyles = React.useMemo(
    () =>
      StyleSheet.create({
    container: {
          backgroundColor: "transparent",
    },
    title: {
          color: colors.foreground,
    },
    subtitle: {
          color: colors.mutedForeground,
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
          backgroundColor: colors.peaqPurple,
    },
    navigationButtonText: {
          color: colors.primaryForeground,
    },
    closeButtonText: {
          color: colors.cardForeground,
        },
        errorContainer: {
          backgroundColor: colors.card,
          borderColor: colors.destructive,
        },
        errorIconContainer: {
          backgroundColor: `${colors.destructive}15`,
        },
        errorTitle: {
          color: colors.destructive,
        },
        errorMessage: {
          color: colors.mutedForeground,
        },
        goBackButton: {
          backgroundColor: colors.peaqPurple,
          borderColor: colors.peaqPurple,
        },
        goBackButtonText: {
          color: colors.primaryForeground,
        },
        loadingContainer: {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
    loadingText: {
      color: colors.mutedForeground,
    },
    transactionHash: {
      borderColor: colors.peaqPurple,
      shadowColor: colors.peaqPurple,
    },
    explorerButton: {
      backgroundColor: colors.peaqPurple,
      borderColor: colors.peaqPurpleHover,
    },
    explorerButtonText: {
      color: colors.primaryForeground,
    },
      }),
    [colors]
  );

  return (
    <div
      style={{
        height: "100vh",
        backgroundColor: "transparent",
      color: colors.text,
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {/* Background Content */}
      <View style={styles.backgroundContent}>
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.1, scale: 1 }}
          transition={{
            type: "timing",
            duration: 3000,
            loop: true,
          }}
          style={styles.backgroundElement}
        />
        
        <View style={styles.content}>
          <Text style={dynamicStyles.title}>{t('payment.processing')}</Text>
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
              type: "spring",
              damping: 15,
              stiffness: 100,
            }}
            style={styles.modalContent}
            onLayout={(event) => {
              const { height } = event.nativeEvent.layout;
              setModalHeight(height);
            }}
          >
            {needsScrolling ? (
              <ScrollView
                style={styles.modalScrollView}
                contentContainerStyle={styles.modalScrollContent}
                showsVerticalScrollIndicator={false}
                bounces={true}
                alwaysBounceVertical={false}
                keyboardShouldPersistTaps="handled"
              >
                <View
                  style={[styles.modalGradient, dynamicStyles.modalBackground]}
                  onLayout={(event) => {
                    const { height } = event.nativeEvent.layout;
                    setContentHeight(height);
                  }}
                >
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
{t('payment.transactionInProgress')}
                  </Text>
                  <Text 
                        style={[
                          styles.modalSubtitle,
                          dynamicStyles.machineName,
                        ]}
                    numberOfLines={1}
                    adjustsFontSizeToFit={true}
                  >
                    {machine.name} • {machine.type}
                  </Text>
                  <View style={styles.priceContainer}>
                    <Text 
                          style={[
                            styles.priceLabel,
                            dynamicStyles.progressText,
                          ]}
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
                      {price} peaq
                    </Text>
                  </View>
                </View>
              </View>

                  {/* Loading Airdrop Status */}
                  {isLoadingAirdropStatus && (
                    <MotiView
                      from={{ opacity: 0, translateY: 20 }}
                      animate={{ opacity: 1, translateY: 0 }}
                      transition={{
                        type: "timing",
                        duration: 500,
                      }}
                      style={[
                        styles.loadingContainer,
                        dynamicStyles.loadingContainer,
                      ]}
                    >
                      <Text
                        style={[styles.loadingText, dynamicStyles.loadingText]}
                      >
⏳ {t('payment.checkingEligibility')}
                      </Text>
                    </MotiView>
                  )}

              {/* Payment Steps */}
                  {!isLoadingAirdropStatus && (
              <View style={styles.stepsContainer}>
                {paymentSteps.map((step, index) => {
                        const isActive = index === currentStep;
                        const isCompleted = index < currentStep;
                        const isError = false; // Could be implemented for error handling

                        const status = isCompleted
                          ? "completed"
                          : isActive
                          ? "active"
                          : "pending";
                  
                  return (
                    <MotiView
                      key={step.id}
                      from={{ opacity: 0, translateX: -20 }}
                      animate={{ opacity: 1, translateX: 0 }}
                      transition={{
                              type: "timing",
                        duration: 500,
                        delay: index * 200,
                      }}
                      style={styles.stepContainer}
                    >
                      <View style={styles.stepContent}>
                              <View
                                style={[
                          styles.stepIcon,
                                  { backgroundColor: getStepColor(status) },
                                ]}
                              >
                          <Text style={styles.stepIconText}>
                            {getStepIcon(index, status)}
                          </Text>
                        </View>
                        
                        <View style={styles.stepInfo}>
                          <Text 
                            style={[
                              styles.stepTitle,
                              dynamicStyles.stepTitle,
                                    {
                                      color:
                                        isActive || isCompleted
                                          ? colors.text
                                          : colors.textSecondary,
                                    },
                            ]}
                            numberOfLines={2}
                            adjustsFontSizeToFit={true}
                          >
                            {step.title}
                          </Text>
                          <Text 
                            style={[
                              styles.stepDescription,
                                    dynamicStyles.stepDescription,
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
                              <View
                                style={[
                          styles.progressLine,
                                  {
                                    backgroundColor: isCompleted
                                      ? "#10B981"
                                      : "rgba(255, 255, 255, 0.1)",
                                  },
                                ]}
                              />
                      )}
                    </MotiView>
                        );
                })}
              </View>
                  )}

                  {/* Enhanced Error Display */}
              {error && !(error.type === 'network' && (chainId === 3338 || chainId === 9990)) && (
                    <MotiView
                      from={{ opacity: 0, translateY: 30, scale: 0.9 }}
                      animate={{ opacity: 1, translateY: 0, scale: 1 }}
                      transition={{
                        type: "spring",
                        damping: 15,
                        stiffness: 200,
                      }}
                      style={[
                        styles.errorContainer,
                        dynamicStyles.errorContainer,
                      ]}
                    >
                      {/* Error Icon */}
                      <View
                        style={[
                          styles.errorIconContainer,
                          dynamicStyles.errorIconContainer,
                        ]}
                      >
                        <Text style={styles.errorIcon}>
                          {error.type === "wallet"
                            ? "👛"
                            : error.type === "balance"
                            ? "💰"
                            : error.type === "network"
                            ? "🌐"
                            : error.type === "transaction"
                            ? "⚠️"
                            : "❌"}
                        </Text>
                      </View>

                      {/* Error Content */}
                      <View style={styles.errorContent}>
                        <Text
                          style={[styles.errorTitle, dynamicStyles.errorTitle]}
                        >
                          {error.title}
                        </Text>
                        <Text
                          style={[
                            styles.errorMessage,
                            dynamicStyles.errorMessage,
                          ]}
                        >
                          {error.message}
                        </Text>
                      </View>

                      {/* Go Back Button */}
                      <View style={styles.errorActions}>
                        <TouchableOpacity
                          style={[
                            styles.goBackButton,
                            dynamicStyles.goBackButton,
                          ]}
                          onPress={() => {
                            // Reset error state and go back
                            setError(null);
                            setUserCancelled(true); // Set to true to prevent re-execution
                            setIsAirdropping(false);
                            setIsLoadingAirdropStatus(false);
                            navigation.goBack();
                          }}
                          activeOpacity={0.8}
                        >
                          <Text
                            style={[
                              styles.goBackButtonText,
                              dynamicStyles.goBackButtonText,
                            ]}
                          >
← {t('payment.goBack')}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </MotiView>
                  )}

                  {/* Transaction Hashes */}
                  {(airdropHash || useMachineHash) && (
                <MotiView
                  from={{ opacity: 0, translateY: 20 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{
                        type: "timing",
                    duration: 500,
                  }}
                      style={styles.transactionContainer}
                    >
                      <Text
                        style={[
                          styles.transactionLabel,
                          dynamicStyles.progressText,
                        ]}
                        numberOfLines={1}
                        adjustsFontSizeToFit={true}
                      >
    {t('payment.viewTransactions')}
                  </Text>
                  
                      {/* Airdrop Transaction */}
                      {airdropHash && (
                        <View style={styles.transactionItem}>
                          <Text
                            style={[
                              styles.transactionType,
                              dynamicStyles.progressText,
                            ]}
                          >
{t('payment.airdropTransaction')}:
                          </Text>
                  <TouchableOpacity
                            style={[styles.explorerButton, dynamicStyles.explorerButton]}
                            onPress={() => openTransactionInExplorer(airdropHash)}
                            activeOpacity={0.7}
                          >
                            <Text
                              style={[
                                styles.explorerButtonText,
                                dynamicStyles.explorerButtonText,
                              ]}
                            >
{t('payment.viewOnExplorer')}
                            </Text>
                            <SvgXml
                              xml={externalLinkSvg}
                              width={responsive(14, 16, 18)}
                              height={responsive(14, 16, 18)}
                              color={colors.peaqPurple}
                              style={styles.externalIcon}
                            />
                          </TouchableOpacity>
                        </View>
                      )}

                      {/* Use Machine Transaction */}
                      {useMachineHash && (
                        <View style={styles.transactionItem}>
                          <Text
                            style={[
                              styles.transactionType,
                              dynamicStyles.progressText,
                            ]}
                          >
{t('payment.machineTransaction')}:
                          </Text>
                          <TouchableOpacity
                            style={[styles.explorerButton, dynamicStyles.explorerButton]}
                            onPress={() => openTransactionInExplorer(useMachineHash)}
                            activeOpacity={0.7}
                          >
                            <Text
                              style={[
                                styles.explorerButtonText,
                                dynamicStyles.explorerButtonText,
                              ]}
                            >
{t('payment.viewOnExplorer')}
                            </Text>
                            <SvgXml
                              xml={externalLinkSvg}
                              width={responsive(14, 16, 18)}
                              height={responsive(14, 16, 18)}
                              color={colors.peaqPurple}
                              style={styles.externalIcon}
                            />
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
                        type: "spring",
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
{t('payment.success')}
                      </Text>

                      {/* Navigation Button */}
                      <MotiView
                        from={{ opacity: 0, translateY: 20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{
                          type: "timing",
                          duration: 500,
                          delay: 500,
                        }}
                        style={styles.navigationButtonContainer}
                      >
                        <TouchableOpacity
                          style={[
                            styles.navigationButton,
                            dynamicStyles.navigationButton,
                          ]}
                          onPress={() => {
                            console.log(
                              "View Ownership Details button pressed"
                            );
                            setShowModal(false);
                            navigation.replace("Ownership", {
                              machine,
                              ownership: {
                                machineId: machine.id,
                                percentage: 0.1,
                                tokens: 10,
                                totalTokens: 1000,
                                earnings: 0.05,
                                lastEarning: new Date().toISOString(),
                              },
                            });
                          }}
                    activeOpacity={0.8}
                  >
                          <Text
                            style={[
                              styles.navigationButtonText,
                              dynamicStyles.navigationButtonText,
                            ]}
                          >
{t('payment.viewOwnership')} →
                          </Text>
                  </TouchableOpacity>
                      </MotiView>
                    </MotiView>
                  )}
                </View>
              </ScrollView>
            ) : (
              <View
                style={[styles.modalGradient, dynamicStyles.modalBackground]}
                onLayout={(event) => {
                  const { height } = event.nativeEvent.layout;
                  setContentHeight(height);
                }}
              >
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
  {t('payment.transactionInProgress')}
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
                        {price} peaq
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Loading Airdrop Status */}
                {isLoadingAirdropStatus && (
                  <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{
                      type: "timing",
                      duration: 500,
                    }}
                    style={[
                      styles.loadingContainer,
                      dynamicStyles.loadingContainer,
                    ]}
                  >
                    <Text
                      style={[styles.loadingText, dynamicStyles.loadingText]}
                    >
⏳ {t('payment.checkingEligibility')}
                    </Text>
                  </MotiView>
                )}

                {/* Payment Steps */}
                {!isLoadingAirdropStatus && (
                  <View style={styles.stepsContainer}>
                    {paymentSteps.map((step, index) => {
                      const isActive = index === currentStep;
                      const isCompleted = index < currentStep;
                      const isError = false; // Could be implemented for error handling

                      const status = isCompleted
                        ? "completed"
                        : isActive
                        ? "active"
                        : "pending";

                      return (
                        <MotiView
                          key={step.id}
                          from={{ opacity: 0, translateX: -20 }}
                          animate={{ opacity: 1, translateX: 0 }}
                          transition={{
                            type: "timing",
                            duration: 500,
                            delay: index * 200,
                          }}
                          style={styles.stepContainer}
                        >
                          <View style={styles.stepContent}>
                            <View
                              style={[
                                styles.stepIcon,
                                { backgroundColor: getStepColor(status) },
                              ]}
                            >
                              <Text style={styles.stepIconText}>
                                {getStepIcon(index, status)}
                              </Text>
                            </View>

                            <View style={styles.stepInfo}>
                              <Text
                                style={[
                                  styles.stepTitle,
                                  dynamicStyles.stepTitle,
                                  {
                                    color:
                                      isActive || isCompleted
                                        ? colors.text
                                        : colors.textSecondary,
                                  },
                                ]}
                                numberOfLines={2}
                                adjustsFontSizeToFit={true}
                              >
                                {step.title}
                              </Text>
                              <Text
                                style={[
                                  styles.stepDescription,
                                  dynamicStyles.stepDescription,
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
                            <View
                              style={[
                                styles.progressLine,
                                {
                                  backgroundColor: isCompleted
                                    ? "#10B981"
                                    : "rgba(255, 255, 255, 0.1)",
                                },
                              ]}
                            />
                          )}
                        </MotiView>
                      );
                    })}
                  </View>
                )}

                {/* Enhanced Error Display */}
                {error && !(error.type === 'network' && (chainId === 3338 || chainId === 9990)) && (
                  <MotiView
                    from={{ opacity: 0, translateY: 30, scale: 0.9 }}
                    animate={{ opacity: 1, translateY: 0, scale: 1 }}
                    transition={{
                      type: "spring",
                      damping: 15,
                      stiffness: 200,
                    }}
                    style={[
                      styles.errorContainer,
                      dynamicStyles.errorContainer,
                    ]}
                  >
                    {/* Error Icon */}
                    <View
                      style={[
                        styles.errorIconContainer,
                        dynamicStyles.errorIconContainer,
                      ]}
                    >
                      <Text style={styles.errorIcon}>
                        {error.type === "wallet"
                          ? "👛"
                          : error.type === "balance"
                          ? "💰"
                          : error.type === "network"
                          ? "🌐"
                          : error.type === "transaction"
                          ? "⚠️"
                          : "❌"}
                      </Text>
                    </View>

                    {/* Error Content */}
                    <View style={styles.errorContent}>
                      <Text
                        style={[styles.errorTitle, dynamicStyles.errorTitle]}
                      >
                        {error.title}
                      </Text>
                      <Text
                        style={[
                          styles.errorMessage,
                          dynamicStyles.errorMessage,
                        ]}
                      >
                        {error.message}
                      </Text>
                    </View>

                    {/* Go Back Button */}
                    <View style={styles.errorActions}>
                      <TouchableOpacity
                        style={[
                          styles.goBackButton,
                          dynamicStyles.goBackButton,
                        ]}
                        onPress={() => {
                          // Reset error state and go back
                          setError(null);
                          setUserCancelled(true); // Set to true to prevent re-execution
                          setIsAirdropping(false);
                          setIsLoadingAirdropStatus(false);
                          navigation.goBack();
                        }}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.goBackButtonText,
                            dynamicStyles.goBackButtonText,
                          ]}
                        >
← {t('payment.goBack')}
                        </Text>
                      </TouchableOpacity>
                    </View>
                </MotiView>
              )}

              {/* Transaction Hashes */}
              {(airdropHash || useMachineHash) && (
                <MotiView
                  from={{ opacity: 0, translateY: 20 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{
                      type: "timing",
                    duration: 500,
                  }}
                  style={styles.transactionContainer}
                >
                  <Text 
                      style={[
                        styles.transactionLabel,
                        dynamicStyles.progressText,
                      ]}
                    numberOfLines={1}
                    adjustsFontSizeToFit={true}
                  >
{t('payment.viewTransactions')}
                  </Text>
                  
                  {/* Airdrop Transaction */}
                  {airdropHash && (
                    <View style={styles.transactionItem}>
                        <Text
                          style={[
                            styles.transactionType,
                            dynamicStyles.progressText,
                          ]}
                        >
{t('payment.airdropTransaction')}:
                        </Text>
                      <TouchableOpacity 
                        style={[styles.explorerButton, dynamicStyles.explorerButton]}
                        onPress={() => openTransactionInExplorer(airdropHash)}
                        activeOpacity={0.7}
                      >
                          <Text
                            style={[
                              styles.explorerButtonText,
                              dynamicStyles.explorerButtonText,
                            ]}
                          >
{t('payment.viewOnExplorer')}
                        </Text>
                          <SvgXml
                            xml={externalLinkSvg}
                            width={responsive(14, 16, 18)}
                            height={responsive(14, 16, 18)}
                            color={colors.peaqPurple}
                            style={styles.externalIcon}
                          />
                      </TouchableOpacity>
                    </View>
                  )}
                  
                  {/* Use Machine Transaction */}
                  {useMachineHash && (
                    <View style={styles.transactionItem}>
                        <Text
                          style={[
                            styles.transactionType,
                            dynamicStyles.progressText,
                          ]}
                        >
{t('payment.machineTransaction')}:
                        </Text>
                      <TouchableOpacity 
                        style={[styles.explorerButton, dynamicStyles.explorerButton]}
                        onPress={() => openTransactionInExplorer(useMachineHash)}
                        activeOpacity={0.7}
                      >
                          <Text
                            style={[
                              styles.explorerButtonText,
                              dynamicStyles.explorerButtonText,
                            ]}
                          >
{t('payment.viewOnExplorer')}
                        </Text>
                          <SvgXml
                            xml={externalLinkSvg}
                            width={responsive(14, 16, 18)}
                            height={responsive(14, 16, 18)}
                            color={colors.peaqPurple}
                            style={styles.externalIcon}
                          />
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
                      type: "spring",
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
{t('payment.success')}
                  </Text>
                  
                  {/* Navigation Button */}
                  <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{
                        type: "timing",
                      duration: 500,
                      delay: 500,
                    }}
                    style={styles.navigationButtonContainer}
                  >
                    <TouchableOpacity
                        style={[
                          styles.navigationButton,
                          dynamicStyles.navigationButton,
                        ]}
                      onPress={() => {
                          console.log("View Ownership Details button pressed");
                          setShowModal(false);
                          navigation.replace("Ownership", {
                          machine,
                          ownership: {
                            machineId: machine.id,
                            percentage: 0.1,
                            tokens: 10,
                            totalTokens: 1000,
                            earnings: 0.05,
                              lastEarning: new Date().toISOString(),
                            },
                          });
                      }}
                      activeOpacity={0.8}
                    >
                        <Text
                          style={[
                            styles.navigationButtonText,
                            dynamicStyles.navigationButtonText,
                          ]}
                        >
{t('payment.viewOwnership')} →
                      </Text>
                    </TouchableOpacity>
                  </MotiView>
                </MotiView>
              )}
            </View>
            )}
          </MotiView>
        </View>
      </Modal>
    </div>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  backgroundElement: {
    position: "absolute",
    width: width * 1.5,
    height: height * 1.5,
    backgroundColor: "#5252D7",
    borderRadius: width * 0.75,
    top: -height * 0.3,
    right: -width * 0.3,
  },
  content: {
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
    fontFamily: "NB International Pro Bold",
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    fontFamily: "NB International Pro",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 380,
    minWidth: 320,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "rgba(14, 13, 12, 0.95)",
    borderWidth: 1,
    borderColor: "rgba(82, 82, 215, 0.2)",
    ...GLASSMORPHISM.shadow,
    maxHeight: height * 0.8,
  },
  modalScrollView: {
    flex: 1,
    borderRadius: 20,
  },
  modalScrollContent: {
    flexGrow: 1,
    paddingBottom: 10,
  },
  modalGradient: {
    padding: 24,
    backgroundColor: "rgba(82, 82, 215, 0.03)",
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 32,
  },
  modernModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(82, 82, 215, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    borderWidth: 2,
    borderColor: "rgba(82, 82, 215, 0.3)",
  },
  headerEmoji: {
    fontSize: 28,
  },
  headerContent: {
    flex: 1,
    gap: 4,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  priceLabel: {
    fontSize: 12,
    fontFamily: "NB International Pro",
  },
  priceValue: {
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: "NB International Pro Bold",
  },
  modalTitle: {
    fontSize: responsive(18, 20, 22),
    fontWeight: "bold",
    marginBottom: responsive(6, 8, 10),
    fontFamily: "NB International Pro Bold",
  },
  modalSubtitle: {
    fontSize: responsive(13, 14, 15),
    fontFamily: "NB International Pro",
  },
  stepsContainer: {
    marginBottom: 24,
  },
  stepContainer: {
    marginBottom: 16,
  },
  stepContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    borderWidth: 2,
    borderColor: "rgba(82, 82, 215, 0.3)",
  },
  stepIconText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    fontSize: responsive(13, 14, 15),
    fontWeight: "600",
    marginBottom: responsive(3, 4, 5),
    fontFamily: "NB International Pro",
  },
  stepDescription: {
    fontSize: responsive(11, 12, 13),
    fontFamily: "NB International Pro",
  },
  // Enhanced Error Styles
  errorContainer: {
    marginTop: responsive(20, 24, 28),
    padding: responsive(20, 24, 28),
    borderRadius: responsive(16, 18, 20),
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  errorIconContainer: {
    width: responsive(60, 70, 80),
    height: responsive(60, 70, 80),
    borderRadius: responsive(30, 35, 40),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: responsive(16, 20, 24),
  },
  errorIcon: {
    fontSize: responsive(28, 32, 36),
  },
  errorContent: {
    alignItems: "center",
    marginBottom: responsive(24, 28, 32),
  },
  errorTitle: {
    fontSize: responsive(18, 20, 22),
    fontFamily: "NB International Pro Bold",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: responsive(8, 10, 12),
  },
  errorMessage: {
    fontSize: responsive(14, 15, 16),
    fontFamily: "NB International Pro",
    textAlign: "center",
    lineHeight: responsive(20, 22, 24),
    maxWidth: responsive(280, 320, 360),
  },
  errorActions: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: responsive(8, 12, 16),
  },
  goBackButton: {
    paddingVertical: responsive(16, 18, 20),
    paddingHorizontal: responsive(32, 36, 40),
    borderRadius: responsive(12, 14, 16),
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#6666FE", // PEAQ purple
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    minWidth: responsive(140, 160, 180),
  },
  goBackButtonText: {
    fontSize: responsive(16, 17, 18),
    fontFamily: "NB International Pro Bold",
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  // Loading Styles
  loadingContainer: {
    padding: responsive(16, 20, 24),
    borderRadius: responsive(12, 14, 16),
    borderWidth: 1,
    alignItems: "center",
    marginBottom: responsive(20, 24, 28),
  },
  loadingText: {
    fontSize: responsive(14, 15, 16),
    fontFamily: "NB International Pro",
    textAlign: "center",
  },
  copyIcon: {
    marginLeft: responsive(8, 10, 12),
  },
  explorerButton: {
    borderRadius: responsive(10, 12, 14),
    padding: responsive(12, 14, 16),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    shadowColor: "#6666FE",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    marginTop: responsive(8, 10, 12),
  },
  explorerButtonText: {
    fontSize: responsive(13, 14, 15),
    fontFamily: "NB International Pro",
    fontWeight: "600",
    marginRight: responsive(6, 8, 10),
  },
  externalIcon: {
    marginLeft: responsive(4, 6, 8),
  },
  progressLine: {
    width: 2,
    height: 20,
    marginLeft: 19,
    marginTop: 8,
  },
  transactionContainer: {
    marginBottom: responsive(20, 24, 28),
  },
  transactionLabel: {
    fontSize: responsive(13, 14, 15),
    color: "#A7A6A5",
    marginBottom: responsive(6, 8, 10),
    fontFamily: "NB International Pro",
  },
  transactionItem: {
    marginBottom: responsive(10, 12, 14),
  },
  transactionType: {
    fontSize: responsive(11, 12, 13),
    color: "#A7A6A5",
    marginBottom: responsive(3, 4, 5),
    fontFamily: "NB International Pro",
  },
  transactionHash: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: responsive(10, 12, 14),
    padding: responsive(10, 12, 14),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(102, 102, 254, 0.3)", // PEAQ purple border
    shadowColor: "#6666FE",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionHashText: {
    fontSize: responsive(11, 12, 13),
    color: "#FFFFFF",
    fontFamily: "NB International Pro",
    flex: 1,
  },
  transactionLink: {
    fontSize: responsive(11, 12, 13),
    color: "#5252D7",
    fontFamily: "NB International Pro",
  },
  successContainer: {
    alignItems: "center",
    paddingVertical: 16,
  },
  successEmoji: {
    fontSize: responsive(44, 48, 52),
    marginBottom: responsive(10, 12, 14),
  },
  successText: {
    fontSize: responsive(16, 18, 20),
    fontWeight: "bold",
    color: "#1D8359",
    fontFamily: "NB International Pro Bold",
    marginBottom: responsive(18, 20, 22),
  },
  navigationButtonContainer: {
    marginTop: 20,
    zIndex: 10,
  },
  navigationButton: {
    backgroundColor: "#5252D7",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 220,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  navigationButtonText: {
    color: "#FFFFFF",
    fontSize: responsive(16, 18, 20),
    fontWeight: "700",
    fontFamily: "NB International Pro Bold",
    textAlign: "center",
  },
});
