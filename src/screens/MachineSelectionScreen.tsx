import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions, ScrollView } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { MotiView } from 'moti'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { RootStackParamList, Machine } from '../types'
import { MOCK_MACHINES, GLASSMORPHISM } from '../constants'
import * as Clipboard from 'expo-clipboard'
import { useChainId, useBalance, useSwitchChain } from '../hooks/usePlatformWagmi'
import { useAccount } from 'wagmi'
import { usePrivy, useWallets } from '../hooks/usePlatformAuth'
import { safeTruncateAddress } from '../utils/safeSlice'
import MachineCard from '../components/MachineCard'
import { useCopyFeedback } from '../components/GlobalUserInfo'
import { useTheme } from '../contexts/ThemeContext'
import { 
  useMachineManager, 
  useTokenBalance, 
  useMachineInfo,
  useClaimableFor,
  useOwnershipBps,
  useAllMachines
} from '../contexts/MachineManagerContext'
import { 
  spacing, 
  fontSizes, 
  responsive, 
  getGridColumns,
  safeAreaPadding,
  glassmorphism,
  shadows
} from '../components/ResponsiveLayout'

const { width } = Dimensions.get('window')

type MachineSelectionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MachineSelection'>

// Component that wraps MachineCard with real contract data
interface MachineCardWithRealDataProps {
  machine: Machine
  index: number
  onPress: (machine: Machine) => void
  onCopyAddress: (address: string) => void
  columns: number
  userAddress: string
}

function MachineCardWithRealData({ 
  machine, 
  index, 
  onPress, 
  onCopyAddress, 
  columns, 
  userAddress 
}: MachineCardWithRealDataProps) {
  // Real-time contract data hooks
  const { machineInfo, isLoading: machineLoading } = useMachineInfo(machine.id)
  const { claimableAmount, isLoading: claimableLoading } = useClaimableFor(machine.id, userAddress)
  const { ownershipBps, isLoading: ownershipLoading } = useOwnershipBps(machine.id, userAddress)
  
  // Create enhanced machine object with real data
  const enhancedMachine: Machine = React.useMemo(() => {
    if (machineInfo) {
      return {
        ...machine,
        name: machineInfo.name,
        address: machineInfo.machineAddr,
        revenue: parseFloat(claimableAmount),
        totalRevenue: parseFloat(machineInfo.lifetimeRevenue),
        isActive: true, // Assume active if we can fetch data
        // Add real contract data
        price: parseFloat(machineInfo.price),
        platformFeeBps: machineInfo.platformFeeBps,
        revenueShareBps: machineInfo.revenueShareBps,
        sharesPerPurchase: parseFloat(machineInfo.sharesPerPurchase),
        totalShares: parseFloat(machineInfo.totalShares),
        unallocatedRevenue: parseFloat(machineInfo.unallocatedRevenue),
        ownershipBps: parseFloat(ownershipBps),
      }
    }
    return machine
  }, [machine, machineInfo, claimableAmount, ownershipBps])
  
  return (
    <View 
      style={[
        styles.machineItem,
        { width: columns === 1 ? '100%' : `${(100 / columns) - 2}%` }
      ]}
    >
      <MachineCard
        machine={enhancedMachine}
        index={index}
        onPress={onPress}
        onCopyAddress={onCopyAddress}
        columns={columns}
        isLoading={machineLoading || claimableLoading || ownershipLoading}
      />
    </View>
  )
}

export default function MachineSelectionScreen() {
  const navigation = useNavigation<MachineSelectionScreenNavigationProp>()
  const [refreshing, setRefreshing] = useState(false)
  const [networkFetchStatus, setNetworkFetchStatus] = useState<string>('')
  const { showCopyFeedback } = useCopyFeedback()
  const { colors } = useTheme()
  
  // Get real machines from contract
  const { machines: contractMachines, isLoading: machinesLoading, error: machinesError } = useAllMachines()
  
  // Machine Manager Context hooks
  const { getAllMachines } = useMachineManager()
  
  // Create dynamic styles based on theme - use useMemo to ensure they update when theme changes
  const dynamicStyles = React.useMemo(() => StyleSheet.create({
    container: {
      ...styles.container,
      backgroundColor: colors.background,
    },
    title: {
      ...styles.title,
      color: colors.text,
    },
    subtitle: {
      ...styles.subtitle,
      color: colors.textSecondary,
    },
    statCard: {
      ...styles.statCard,
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    statValue: {
      ...styles.statValue,
      color: colors.primary,
    },
    statLabel: {
      ...styles.statLabel,
      color: colors.textSecondary,
    },
    sharesInfoSection: {
      ...styles.sharesInfoSection,
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    sharesInfoTitle: {
      ...styles.sharesInfoTitle,
      color: colors.text,
    },
    sharesInfoDescription: {
      ...styles.sharesInfoDescription,
      color: colors.textSecondary,
    },
    sharesInfoItem: {
      ...styles.sharesInfoItem,
      backgroundColor: colors.card,
      borderColor: colors.border,
    },
    sharesInfoItemTitle: {
      ...styles.sharesInfoItemTitle,
      color: colors.text,
    },
    sharesInfoItemText: {
      ...styles.sharesInfoItemText,
      color: colors.textSecondary,
    },
  }), [colors])
  
  // Privy hooks
  const { ready, authenticated } = usePrivy();
  
  // Wagmi hooks
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { data: balance } = useBalance({ address })
  const { switchChain } = useSwitchChain()
  const { wallets } = useWallets()
  
  // Real-time token balance from MachineManagerContext
  const { balance: peaqBalance, isLoading: balanceLoading } = useTokenBalance(address || '')

  useEffect(() => {
    console.log('PrivyWallets wallets.map(w => w.chainId):', wallets.map(w => w.chainId))
    console.log('Wagmi chainId:', chainId)
  }, [wallets])
  
  // Check if connected to Peaq network (Chain ID: 3338)
  const isConnectedToPeaq = chainId === 3338
  const peaqChainId = 3338
  

  // Convert contract machines to our Machine interface using useMemo to prevent infinite loops
  const convertedMachines = React.useMemo(() => {
    if (!contractMachines || contractMachines.length === 0) {
      return MOCK_MACHINES.map(machine => ({
        ...machine,
        address: address || ''
      }))
    }
    
    return contractMachines.map((contractMachine, index) => ({
      id: `${index + 1}`, // Generate ID since contract doesn't provide it
      name: contractMachine.name,
      type: (contractMachine.name.toLowerCase().includes('cafe') ? 'RoboCafe' : 'Humanoid') as 'RoboCafe' | 'Humanoid',
      image: contractMachine.name.toLowerCase().includes('cafe') 
        ? 'coffee-robo-image.png' 
        : 'humanoid.png', // Local images based on machine type
      address: contractMachine.machineOnChainAddr,
      revenue: parseFloat(contractMachine.lifetimeRevenue),
      totalRevenue: parseFloat(contractMachine.lifetimeRevenue),
      isActive: contractMachine.exists || false,
      location: {
        name: 'Cyberpunk City',
        lat: 35.6762,
        lng: 139.6503
      },
      // Contract data fields
      price: parseFloat(contractMachine.price),
      platformFeeBps: contractMachine.platformFeeBps,
      revenueShareBps: contractMachine.revenueShareBps,
      sharesPerPurchase: parseFloat(contractMachine.sharesPerPurchase),
      totalShares: parseFloat(contractMachine.totalShares),
      unallocatedRevenue: parseFloat(contractMachine.unallocatedRevenue),
    }))
  }, [contractMachines, address])

  // Calculate network statistics from converted machines
  const networkStats = React.useMemo(() => {
    if (convertedMachines === MOCK_MACHINES || convertedMachines.length === 0) {
      return {
        totalRevenue: '2,847.32',
        activeCount: 24
      }
    }
    
    let totalRevenue = 0
    let activeCount = 0
    
    for (const machine of convertedMachines) {
      totalRevenue += machine.totalRevenue
      if (machine.isActive) {
        activeCount++
      }
    }
    
    return {
      totalRevenue: totalRevenue.toFixed(2),
      activeCount
    }
  }, [convertedMachines])

  // Use computed values directly instead of state to prevent infinite loops
  const machines = convertedMachines
  const totalNetworkRevenue = networkStats.totalRevenue
  const activeMachinesCount = networkStats.activeCount
  const isLoading = machinesLoading

  useEffect(() => {
    if (!authenticated) {
      // User not authenticated, redirect to onboarding
      navigation.navigate('Onboarding')
    }
  }, [authenticated, navigation])

  // Fetch machines from network when user connects
  useEffect(() => {
    if (address && isConnected) {
      fetchMachinesFromNetwork()
    }
  }, [address, isConnected])

  // Handle network switching to Peaq
  const handleSwitchToPeaq = async () => {
    try {
      await switchChain({ chainId: peaqChainId })
    } catch (error) {
      console.error('Failed to switch to Peaq network:', error)
      Alert.alert('Network Switch Failed', 'Please switch to Peaq network manually in your wallet.')
    }
  }

  // Function to fetch machines using getAllMachines
  const fetchMachinesFromNetwork = async () => {
    try {
      if (!address || !isConnected) return
      
      setNetworkFetchStatus('Fetching from network...')
      const networkMachines = await getAllMachines()
      
      setNetworkFetchStatus(`✅ Fetched ${networkMachines.length} machines from network`)
      
      // The useAllMachines hook will automatically update with the latest data
      // This function provides manual control over when to fetch
    } catch (error) {
      console.error('Failed to fetch machines from network:', error)
      setNetworkFetchStatus('❌ Failed to fetch from network')
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      // Fetch fresh data from the network using getAllMachines
      await fetchMachinesFromNetwork()
    } catch (error) {
      console.error('Failed to refresh machines:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const handleMachinePress = (machine: Machine) => {
    navigation.navigate('PaymentFlow', { machine, action: 'interact' })
  }

  const truncateAddress = (address: string) => {
    return safeTruncateAddress(address);
  }

  const copyAddress = async (address: string) => {
    try {
      await Clipboard.setStringAsync(address)
      showCopyFeedback()
    } catch (error) {
      console.error('Failed to copy address:', error)
      Alert.alert('Error', 'Failed to copy address')
    }
  }


  return (
    <div style={{
      height: '100vh',
      backgroundColor: colors.background,
      color: colors.text,
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
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text style={dynamicStyles.title}>Available Machines</Text>
            <Text style={dynamicStyles.subtitle}>
              Select a machine to interact with and earn
            </Text>
          </View>
        </View>
      </MotiView>

      {/* Stats Cards - Moved to Top */}
      <View style={styles.statsContainer}>
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'timing',
            duration: 800,
            delay: 200,
          }}
          style={styles.statsGrid}
        >
          {/* Total Network Revenue */}
          <LinearGradient
            colors={['rgba(82, 82, 215, 0.1)', 'rgba(132, 132, 254, 0.1)']}
            style={dynamicStyles.statCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.statContent}>
              <Text style={dynamicStyles.statValue}>
                {isLoading ? '...' : totalNetworkRevenue}
              </Text>
              <Text style={dynamicStyles.statLabel}>Total Network Revenue</Text>
              <Text style={styles.statUnit}>peaq</Text>
            </View>
          </LinearGradient>

          {/* Active Machines */}
          <LinearGradient
            colors={['rgba(82, 82, 215, 0.1)', 'rgba(132, 132, 254, 0.1)']}
            style={dynamicStyles.statCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.statContent}>
              <Text style={dynamicStyles.statValue}>
                {isLoading ? '...' : activeMachinesCount}
              </Text>
              <Text style={dynamicStyles.statLabel}>Active Machines</Text>
              <Text style={styles.statUnit}>Online</Text>
            </View>
          </LinearGradient>
        </MotiView>
      </View>


          {!ready ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Initializing...</Text>
              <Text style={styles.loadingSubtext}>Setting up wallet connection</Text>
            </View>
          ) : !authenticated ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Please connect your wallet</Text>
              <Text style={styles.emptySubtext}>You need to be authenticated to view machines</Text>
            </View>
          ) : !isConnected ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Wallet not connected</Text>
              <Text style={styles.emptySubtext}>Please connect your wallet to continue</Text>
            </View>
          ) : isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading machines...</Text>
              <Text style={styles.loadingSubtext}>Fetching from Peaq network</Text>
            </View>
          ) : machines.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No machines available</Text>
              <Text style={styles.emptySubtext}>Check back later for new machines</Text>
            </View>
          ) : (
            <View style={styles.machinesGrid}>
              {machines.map((machine, index) => (
                <MachineCardWithRealData
                  key={machine.id}
                  machine={machine}
                  index={index}
                  onPress={handleMachinePress}
                  onCopyAddress={copyAddress}
                  columns={getGridColumns()}
                  userAddress={address || ''}
                />
              ))}
            </View>
          )}

          {/* Ownership Shares Information Section */}
          <View style={[styles.sharesInfoSection, dynamicStyles.sharesInfoSection]}>
            <Text style={[styles.sharesInfoTitle, dynamicStyles.sharesInfoTitle]}>How Ownership Works</Text>
            <Text style={[styles.sharesInfoDescription, dynamicStyles.sharesInfoDescription]}>
              Every time you use a machine, you become a co-owner! You receive fractional shares that entitle you to a percentage of future earnings from that machine.
            </Text>
            <View style={styles.sharesInfoDetails}>
              <View style={[styles.sharesInfoItem, dynamicStyles.sharesInfoItem]}>
                <Text style={[styles.sharesInfoItemTitle, dynamicStyles.sharesInfoItemTitle]}>🎯 Fractional Ownership</Text>
                <Text style={[styles.sharesInfoItemText, dynamicStyles.sharesInfoItemText]}>
                  Each interaction gives you shares proportional to the machine's revenue sharing model
                </Text>
              </View>
              <View style={[styles.sharesInfoItem, dynamicStyles.sharesInfoItem]}>
                <Text style={[styles.sharesInfoItemTitle, dynamicStyles.sharesInfoItemTitle]}>💰 Passive Income</Text>
                <Text style={[styles.sharesInfoItemText, dynamicStyles.sharesInfoItemText]}>
                  Your shares earn you a percentage of all future revenue from the machine
                </Text>
              </View>
              <View style={[styles.sharesInfoItem, dynamicStyles.sharesInfoItem]}>
                <Text style={[styles.sharesInfoItemTitle, dynamicStyles.sharesInfoItemTitle]}>🔄 Compound Growth</Text>
                <Text style={[styles.sharesInfoItemText, dynamicStyles.sharesInfoItemText]}>
                  The more you use machines, the more you own, creating a growing passive income stream
                </Text>
              </View>
            </View>
          </View>

    </div>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    backgroundColor: '#0E0D0C',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: safeAreaPadding.bottom + spacing.xl,
  },
  machinesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: safeAreaPadding.horizontal,
    gap: spacing.lg,
  },
  machineItem: {
    marginBottom: spacing.lg,
  },
  header: {
    paddingTop: safeAreaPadding.top,
    paddingHorizontal: safeAreaPadding.horizontal,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: responsive(spacing.sm, spacing.md, spacing.lg),
  },
  headerText: {
    alignItems: 'center',
    flex: 1,
    minWidth: responsive(200, 250, 300),
  },
  networkStatusContainer: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: 'rgba(82, 82, 215, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(82, 82, 215, 0.3)',
  },
  networkStatusText: {
    fontSize: fontSizes.sm,
    color: '#60A5FA',
    fontFamily: 'NB International Pro',
    textAlign: 'center',
  },
  title: {
    fontSize: responsive(fontSizes.lg, fontSizes.xl, fontSizes.xxl),
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: responsive(spacing.xs, spacing.sm, spacing.md),
    fontFamily: 'NB International Pro Bold',
    lineHeight: responsive(fontSizes.lg * 1.2, fontSizes.xl * 1.2, fontSizes.xxl * 1.2),
  },
  subtitle: {
    fontSize: responsive(fontSizes.sm, fontSizes.md, fontSizes.lg),
    color: '#A7A6A5',
    textAlign: 'center',
    fontFamily: 'NB International Pro',
    lineHeight: responsive(fontSizes.sm * 1.3, fontSizes.md * 1.3, fontSizes.lg * 1.3),
  },
  statsContainer: {
    paddingHorizontal: safeAreaPadding.horizontal,
    marginBottom: spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(82, 82, 215, 0.2)',
    ...shadows.medium,
  },
  statContent: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: responsive(fontSizes.xl, fontSizes.xxl, fontSizes.xxxl),
    fontWeight: 'bold',
    color: '#5252D7',
    fontFamily: 'NB International Pro Bold',
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: responsive(fontSizes.sm, fontSizes.md, fontSizes.lg),
    color: '#A7A6A5',
    fontFamily: 'NB International Pro',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  statUnit: {
    fontSize: responsive(fontSizes.xs, fontSizes.sm, fontSizes.md),
    color: '#5252D7',
    fontFamily: 'NB International Pro',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    width: '100%',
  },
  loadingText: {
    fontSize: responsive(fontSizes.lg, fontSizes.xl, fontSizes.xxl),
    color: '#FFFFFF',
    fontFamily: 'NB International Pro Bold',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: responsive(fontSizes.md, fontSizes.lg, fontSizes.xl),
    color: '#A7A6A5',
    fontFamily: 'NB International Pro',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    width: '100%',
  },
  emptyText: {
    fontSize: responsive(fontSizes.lg, fontSizes.xl, fontSizes.xxl),
    color: '#FFFFFF',
    fontFamily: 'NB International Pro Bold',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: responsive(fontSizes.md, fontSizes.lg, fontSizes.xl),
    color: '#A7A6A5',
    fontFamily: 'NB International Pro',
    textAlign: 'center',
  },
  sharesInfoSection: {
    marginTop: spacing.xxl,
    marginHorizontal: safeAreaPadding.horizontal,
    padding: spacing.xl,
    backgroundColor: 'rgba(82, 82, 215, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(82, 82, 215, 0.2)',
    ...GLASSMORPHISM.shadow,
  },
  sharesInfoTitle: {
    fontSize: responsive(fontSizes.xl, fontSizes.xxl, fontSizes.xxxl),
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'NB International Pro',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  sharesInfoDescription: {
    fontSize: responsive(fontSizes.md, fontSizes.lg, fontSizes.xl),
    color: '#E5E7EB',
    fontFamily: 'NB International Pro',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  sharesInfoDetails: {
    gap: spacing.lg,
  },
  sharesInfoItem: {
    padding: spacing.lg,
    backgroundColor: 'rgba(31, 41, 55, 0.3)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(82, 82, 215, 0.1)',
  },
  sharesInfoItemTitle: {
    fontSize: responsive(fontSizes.lg, fontSizes.xl, fontSizes.xxl),
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'NB International Pro',
    marginBottom: spacing.sm,
  },
  sharesInfoItemText: {
    fontSize: responsive(fontSizes.md, fontSizes.lg, fontSizes.xl),
    color: '#D1D5DB',
    fontFamily: 'NB International Pro',
    lineHeight: 22,
  },
})
