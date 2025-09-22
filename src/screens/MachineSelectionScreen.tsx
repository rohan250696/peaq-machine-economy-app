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
import { useLanguage } from '../contexts/LanguageContext'
import PeaqSharingTokenIcon from '../components/PeaqSharingTokenIcon'
import { SvgXml } from 'react-native-svg'
import { 
  useTokenBalance, 
  useMachineCount,
  useAllMachines,
  useProfitTokenBalance,
  useProfitTokenInfo,
  useMachineManagerBalance,
  useTotalNetworkRevenue
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
import { isSmallScreen } from '../utils/responsive'
import SidebarLayout from '../components/SidebarLayout'
import NewHeader from '../components/NewHeader'
import { env } from '../config/env'
import { KBW_APP_WALLET_KEY } from '@env'

const { width } = Dimensions.get('window')

// SVG assets for profit token logo
const peaqLogoLightSvg = `<svg width="36" height="37" viewBox="0 0 36 37" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="0.5" y="1" width="35" height="35" rx="17.5" fill="#F8F7F6"/>
<rect x="0.5" y="1" width="35" height="35" rx="17.5" stroke="#EBE9E8"/>
<path d="M23.6097 13.5C23.5483 13.5 23.4869 13.5 23.4284 13.5C20.9072 13.5 19.4097 15.0683 18.3861 16.4324C17.9941 16.9561 17.6315 17.5086 17.2805 18.0439C16.6195 19.054 15.9965 20.0065 15.2624 20.6942C14.4844 21.4223 13.5075 21.8079 12.4371 21.8079C11.5655 21.7849 10.7524 21.4281 10.1499 20.8065C9.54444 20.1878 9.21101 19.3734 9.21101 18.5101C9.21394 17.6324 9.57369 16.7748 10.1996 16.1619C10.8343 15.5374 11.6766 15.195 12.5716 15.1921H12.5774C12.9401 15.1921 13.3701 15.264 13.7883 15.3964C13.8702 15.4223 13.9345 15.4827 13.9638 15.5662C13.993 15.6496 13.9784 15.7417 13.9258 15.8137L11.7468 18.8928C11.6825 18.9849 11.6766 19.1 11.7293 19.1978C11.7819 19.2957 11.8813 19.3561 11.9925 19.3561H13.2297C13.3964 19.3561 13.5543 19.2755 13.6479 19.1403L15.8971 15.9432C15.9877 15.8165 16.0462 15.6755 16.0784 15.523C16.1077 15.3705 16.1077 15.218 16.0755 15.0683C16.0433 14.9158 15.979 14.7777 15.8883 14.6511C15.7976 14.5245 15.6836 14.4209 15.549 14.3403C15.4584 14.2856 15.3648 14.2338 15.2653 14.182C14.4405 13.7417 13.5075 13.5086 12.5687 13.5086C11.2174 13.5086 9.94806 14.0295 8.99165 14.9705C8.04987 15.8971 7.50586 17.1863 7.50001 18.5101C7.49709 19.8108 8.00015 21.0424 8.91853 21.9777C9.83399 22.9187 11.0653 23.4597 12.3873 23.4942C13.8088 23.4942 15.0635 23.0108 16.2217 22.0209C17.2542 21.1345 18.0439 19.9835 18.7049 18.9763C19.2196 18.1906 19.7022 17.4511 20.2316 16.8381C20.4159 16.6223 20.5943 16.4381 20.7756 16.2712C21.577 15.5345 22.4223 15.1921 23.4343 15.1921C23.4781 15.1921 23.5191 15.1921 23.5629 15.1921C24.4345 15.2151 25.2476 15.5719 25.8501 16.1935C26.3707 16.7259 26.6983 17.4309 26.7744 18.1763C26.7861 18.2856 26.7919 18.3978 26.7919 18.5072C26.789 19.3906 26.438 20.2194 25.8033 20.8439C25.1687 21.4683 24.3263 21.8108 23.4313 21.8137H23.4255C22.9634 21.8137 22.5129 21.7043 22.2175 21.6122C22.1356 21.5863 22.0713 21.5259 22.0421 21.4424C22.0128 21.359 22.0274 21.2669 22.0801 21.1921L24.2503 18.1475C24.3146 18.0554 24.3234 17.9403 24.2707 17.8424C24.2181 17.7417 24.1187 17.6842 24.0046 17.6842H22.7703C22.6036 17.6842 22.4486 17.7647 22.3521 17.9L20.1058 21.0655C20.0152 21.1921 19.9567 21.3331 19.9245 21.4856C19.8953 21.6381 19.8953 21.7906 19.9274 21.9403C19.9596 22.0928 20.024 22.2309 20.1146 22.3576C20.2024 22.4784 20.3252 22.5906 20.4597 22.6712C20.5533 22.7259 20.6411 22.7777 20.7347 22.8266C21.5595 23.2669 22.4925 23.5 23.4313 23.5C24.7855 23.5 26.0549 22.9791 27.0113 22.0381C27.9677 21.0971 28.4971 19.8482 28.5 18.5158C28.5029 17.2209 27.9852 15.946 27.0785 15.0223C26.1631 14.0784 24.9317 13.5403 23.6097 13.5Z" fill="#6666FE"/>
</svg>`

const peaqLogoDarkSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="24" height="24" rx="12" fill="#0F0E0D"/>
<path d="M15.7435 8.57129C15.7025 8.57129 15.6615 8.57129 15.6225 8.57129C13.9402 8.57129 12.941 9.64673 12.258 10.5821C11.9964 10.9412 11.7545 11.3201 11.5203 11.6871C11.0792 12.3797 10.6635 13.0329 10.1737 13.5045C9.65454 14.0037 9.00271 14.2681 8.28843 14.2681C7.70686 14.2524 7.16431 14.0077 6.76229 13.5814C6.35831 13.1572 6.13583 12.5988 6.13583 12.0068C6.13778 11.4049 6.37783 10.8169 6.79547 10.3966C7.21896 9.96837 7.78102 9.73355 8.3782 9.73158H8.38211C8.6241 9.73158 8.91099 9.78091 9.19006 9.87168C9.24471 9.88944 9.28764 9.93088 9.30716 9.9881C9.32668 10.0453 9.31692 10.1085 9.28179 10.1578L7.82786 12.2692C7.78492 12.3324 7.78102 12.4113 7.81615 12.4784C7.85127 12.5455 7.91763 12.5869 7.99179 12.5869H8.81731C8.92855 12.5869 9.03394 12.5317 9.09639 12.4389L10.5972 10.2466C10.6577 10.1598 10.6967 10.0631 10.7182 9.9585C10.7377 9.85392 10.7377 9.74934 10.7162 9.64673C10.6947 9.54214 10.6518 9.44742 10.5913 9.3606C10.5308 9.27378 10.4547 9.20274 10.3649 9.14749C10.3044 9.10999 10.242 9.07448 10.1756 9.03896C9.62527 8.73704 9.00271 8.57721 8.37625 8.57721C7.47462 8.57721 6.62763 8.93437 5.98946 9.57963C5.36105 10.215 4.99805 11.0991 4.99415 12.0068C4.9922 12.8987 5.32787 13.7433 5.94067 14.3846C6.55152 15.0298 7.37314 15.4008 8.25525 15.4245C9.20373 15.4245 10.041 15.093 10.8138 14.4142C11.5027 13.8064 12.0296 13.0171 12.4707 12.3264C12.8142 11.7877 13.1362 11.2806 13.4894 10.8603C13.6124 10.7123 13.7314 10.586 13.8524 10.4716C14.3871 9.9664 14.9512 9.73158 15.6264 9.73158C15.6557 9.73158 15.683 9.73158 15.7123 9.73158C16.2938 9.74736 16.8364 9.99205 17.2384 10.4183C17.5858 10.7833 17.8044 11.2668 17.8551 11.7779C17.8629 11.8529 17.8668 11.9298 17.8668 12.0048C17.8649 12.6106 17.6307 13.1789 17.2072 13.6071C16.7837 14.0353 16.2216 14.2701 15.6245 14.2721H15.6205C15.3122 14.2721 15.0117 14.1971 14.8145 14.134C14.7599 14.1162 14.717 14.0748 14.6974 14.0175C14.6779 13.9603 14.6877 13.8972 14.7228 13.8459L16.1709 11.7581C16.2138 11.695 16.2197 11.6161 16.1846 11.549C16.1494 11.4799 16.0831 11.4404 16.007 11.4404H15.1834C15.0722 11.4404 14.9687 11.4957 14.9043 11.5884L13.4055 13.759C13.345 13.8459 13.306 13.9426 13.2845 14.0471C13.265 14.1517 13.265 14.2563 13.2864 14.3589C13.3079 14.4635 13.3509 14.5582 13.4114 14.645C13.4699 14.7279 13.5519 14.8049 13.6416 14.8601C13.7041 14.8976 13.7626 14.9331 13.8251 14.9667C14.3754 15.2686 14.998 15.4284 15.6245 15.4284C16.528 15.4284 17.375 15.0713 18.0132 14.426C18.6514 13.7807 19.0046 12.9243 19.0066 12.0107C19.0085 11.1227 18.6631 10.2486 18.0581 9.61515C17.4472 8.96792 16.6256 8.59891 15.7435 8.57129Z" fill="#6666FE"/>
</svg>`

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
  // No need for individual useMachineInfo calls - we already have all the data from useAllMachines
  // The machine object passed here already contains the real contract data processed in the main component
  
  return (
    <View 
      style={[
        styles.machineItem,
        { width: columns === 1 ? '100%' : `${(100 / columns) - 2}%` }
      ]}
    >
      <MachineCard
        machine={machine}
        index={index}
        onPress={onPress}
        onCopyAddress={onCopyAddress}
        columns={columns}
        isLoading={false} // Data is already processed from useAllMachines
      />
    </View>
  )
}

export default function MachineSelectionScreen() {
  const navigation = useNavigation<MachineSelectionScreenNavigationProp>()
  const [refreshing, setRefreshing] = useState(false)
  const [networkFetchStatus, setNetworkFetchStatus] = useState<string>('')
  const { showCopyFeedback } = useCopyFeedback()
  const { colors, isDarkMode } = useTheme()
  const { t } = useLanguage()

  //console.log("KBW_APP_WALLET_KEY", KBW_APP_WALLET_KEY);
  
  // Get real machines from contract
  const { machines: contractMachines, isLoading: machinesLoading, error: machinesError } = useAllMachines()
  const { count: machineCount } = useMachineCount()
  
  // Create dynamic styles based on theme - use useMemo to ensure they update when theme changes
  const dynamicStyles = React.useMemo(() => StyleSheet.create({
    container: {
      ...styles.container,
      backgroundColor: 'transparent',
    },
    title: {
      ...styles.title,
      color: colors.foreground,
    },
    subtitle: {
      ...styles.subtitle,
      color: colors.mutedForeground,
    },
    statCard: {
      ...styles.statCard,
      backgroundColor: isDarkMode ? '#3A3A3A' : '#F8F7F6', // Dark gray for dark mode, light beige for light mode
      borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    },
    statValue: {
      ...styles.statValue,
      color: isDarkMode ? colors.peaqPurple : '#2F1D74', // Purple for dark mode, dark purple for light mode
    },
    statLabel: {
      ...styles.statLabel,
      color: isDarkMode ? colors.mutedForeground : '#5B5A59', // Muted for dark mode, darker gray for light mode
    },
    statUnit: {
      ...styles.statUnit,
      color: isDarkMode ? colors.peaqPurple : '#2F1D74', // Purple for dark mode, dark purple for light mode
    },
    profitTokenCard: {
      backgroundColor: isDarkMode ? '#2F1D74' : '#3D2B8A', // Darker purple for dark mode, slightly lighter for light mode
      borderColor: isDarkMode ? 'rgba(132, 132, 254, 0.3)' : 'rgba(132, 132, 254, 0.4)',
    },
    profitTokenName: {
      color: '#FFFFFF', // White text for better contrast on purple background
    },
    profitTokenSymbol: {
      color: 'rgba(255, 255, 255, 0.8)', // Slightly transparent white
    },
    profitTokenBalanceLabel: {
      color: 'rgba(255, 255, 255, 0.7)', // More transparent white for label
    },
    profitTokenBalanceValue: {
      color: '#FFFFFF', // White text for balance value
    },
    dataSourceText: {
      color: colors.mutedForeground,
      fontSize: responsive(fontSizes.xs, fontSizes.sm, fontSizes.md),
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
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  
  // Get Profit Sharing Token data
  const { balance: profitTokenBalance, isLoading: profitBalanceLoading } = useProfitTokenBalance(address)
  const { name: profitTokenName, symbol: profitTokenSymbol, isLoading: profitInfoLoading } = useProfitTokenInfo()
  
  // Get MachineManager contract balance (old approach)
  const { balance: machineManagerBalance, isLoading: managerBalanceLoading } = useMachineManagerBalance()
  
  // Get total network revenue from contract (new approach)
  const { totalRevenue: contractTotalRevenue, isLoading: totalRevenueLoading } = useTotalNetworkRevenue()
  
  // Check if connected to Peaq network (Chain ID: 3338 or 9990)
  const isConnectedToPeaq = chainId === 3338 || chainId === 9990

  // Convert contract machines to our Machine interface
  const machines = React.useMemo(() => {
    // If we're not connected to Peaq network, use mock data
    if (!isConnectedToPeaq) {
      return MOCK_MACHINES.map(machine => ({
        ...machine,
        address: address || ''
      }))
    }
    
    // If we're loading or have an error, use mock data
    if (machinesLoading || machinesError) {
      return MOCK_MACHINES.map(machine => ({
        ...machine,
        address: address || ''
      }))
    }
    
    // If no contract machines, use mock data
    if (!contractMachines || contractMachines.length === 0) {
      return MOCK_MACHINES.map(machine => ({
        ...machine,
        address: address || ''
      }))
    }
    
    // Use real contract machines
    return contractMachines.map((contractMachine, index) => {
      return {
      id: `${index}`, // Generate ID since contract doesn't provide it
      name: contractMachine.name,
      type: (contractMachine.name.toLowerCase().includes('cafe') ? 'RoboCafe' : 'Humanoid') as 'RoboCafe' | 'Humanoid',
      image: contractMachine.name.toLowerCase().includes('cafe') 
        ? 'coffee-robo-image.png' 
        : 'humanoid.png', // Local images based on machine type
      address: contractMachine.machineAddr,
      revenue: 0, // No longer tracked in new contract
      totalRevenue: 0, // No longer tracked in new contract
      isActive: contractMachine.exists || false,
      location: {
        name: 'Cyberpunk City',
        lat: 35.6762,
        lng: 139.6503
      },
      // Contract data fields
      price: contractMachine.price ? parseFloat(contractMachine.price) : 0, // Convert string to number with fallback
      platformFeeBps: contractMachine.platformFeeBps || 0, // Fallback to 0 if undefined
      }
    })
  }, [contractMachines, address, machinesLoading, machinesError, isConnectedToPeaq])

  // Calculate network statistics from real machines
  const networkStats = React.useMemo(() => {
    if (!contractMachines || contractMachines.length === 0) {
      return {
        totalRevenue: '0',
        activeCount: 0
      }
    }
    
    let activeCount = 0
    for (const machine of contractMachines) {
      if (machine.exists) {
        activeCount++
      }
    }
    
    return {
      totalRevenue: contractTotalRevenue || '0', // Use contract's totalRevenue function
      activeCount
    }
  }, [contractMachines, contractTotalRevenue])

  // Use computed values directly instead of state to prevent infinite loops
  const totalNetworkRevenue = networkStats.totalRevenue
  const activeMachinesCount = networkStats.activeCount
  const isLoading = machinesLoading || totalRevenueLoading

  useEffect(() => {
    if (!authenticated) {
      // User not authenticated, redirect to onboarding
      navigation.navigate('Onboarding')
    }
  }, [authenticated, navigation])

  // Fetch machine count when user connects
  useEffect(() => {
    if (address && isConnected) {
      fetchMachineCount()
    }
  }, [address, isConnected])

  // Function to fetch machine count
  const fetchMachineCount = async () => {
    try {
      if (!address || !isConnected) return
      
      setNetworkFetchStatus('Fetching machine count...')
      
      setNetworkFetchStatus(`✅ Found ${machineCount} machines on network`)
      
    } catch (error) {
      console.error('Failed to fetch machine count:', error)
      setNetworkFetchStatus('❌ Failed to fetch machine count')
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      // Fetch fresh machine count from the network
      await fetchMachineCount()
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
    <SidebarLayout>
      <NewHeader />
    <div style={{
      height: '100vh',
      backgroundColor: 'transparent',
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
            <Text style={dynamicStyles.title}>{t('machines.availableMachines')}</Text>
            <Text style={dynamicStyles.subtitle}>
{t('machines.selectToEarn')}
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
          style={[styles.statsGrid, isSmallScreen && styles.statsGridStacked]}
        >
          {/* Total Network Revenue */}
          <View style={[dynamicStyles.statCard, isSmallScreen && styles.statCardStacked]}>
            <View style={styles.statContent}>
              <Text style={dynamicStyles.statLabel}>{t('machines.totalNetworkRevenue')}</Text>
              <Text style={dynamicStyles.statValue}>
                {isLoading ? '...' : totalNetworkRevenue}
              </Text>
              <Text style={[styles.statUnit, dynamicStyles.statUnit]}>{t('units.peaq')}</Text>
            </View>
          </View>

          {/* Active Machines */}
          <View style={[dynamicStyles.statCard, isSmallScreen && styles.statCardStacked]}>
            <View style={styles.statContent}>
              <Text style={dynamicStyles.statLabel}>{t('machines.activeMachines')}</Text>
              <Text style={dynamicStyles.statValue}>
                {isLoading ? '...' : activeMachinesCount}
              </Text>
              <Text style={[styles.statUnit, dynamicStyles.statUnit]}>{t('machines.online')}</Text>
            </View>
          </View>
        </MotiView>
      </View>

      {/* Profit Sharing Token Section */}
      <View style={styles.profitTokenContainer}>
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'timing',
            duration: 800,
            delay: 400,
          }}
          style={[styles.profitTokenCard, dynamicStyles.profitTokenCard]}
        >
          <View style={styles.profitTokenHeader}>
            <SvgXml 
              xml={isDarkMode ? peaqLogoDarkSvg : peaqLogoLightSvg} 
              width={responsive(24, 28, 32)} 
              height={responsive(24, 28, 32)}
            />
            <View style={styles.profitTokenInfo}>
              <Text style={[styles.profitTokenName, dynamicStyles.profitTokenName]}>
                {profitInfoLoading ? t('common.loading') : (profitTokenName || t('machines.profitSharingToken'))}
              </Text>
              <Text style={[styles.profitTokenSymbol, dynamicStyles.profitTokenSymbol]}>
                {profitInfoLoading ? '...' : (profitTokenSymbol || 'PROFIT')}
              </Text>
            </View>
          </View>
          
          <View style={styles.profitTokenBalance}>
            <Text style={[styles.profitTokenBalanceLabel, dynamicStyles.profitTokenBalanceLabel]}>
{t('common.balance')}:
            </Text>
            <Text style={[styles.profitTokenBalanceValue, dynamicStyles.profitTokenBalanceValue]}>
              {profitBalanceLoading ? t('common.loading') : `${parseFloat(profitTokenBalance || '0')} ${profitTokenSymbol || t('units.pft')}`}
            </Text>
          </View>
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

    </div>
    </SidebarLayout>
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
    paddingHorizontal: responsive(spacing.md, safeAreaPadding.horizontal, safeAreaPadding.horizontal + spacing.md),
    marginBottom: responsive(spacing.md, spacing.lg, spacing.xl),
    marginTop: responsive(spacing.sm, spacing.md, spacing.lg),
  },
  statsGrid: {
    flexDirection: 'row',
    gap: responsive(spacing.sm, spacing.md, spacing.lg),
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    minWidth: responsive(140, 160, 180),
    maxWidth: responsive(200, 220, 250),
    borderRadius: responsive(12, 16, 20),
    padding: responsive(spacing.md, spacing.lg, spacing.xl),
    borderWidth: 1,
    borderColor: 'rgba(82, 82, 215, 0.2)',
    ...shadows.medium,
  },
  statContent: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: responsive(60, 80, 100),
  },
  statValue: {
    fontSize: responsive(fontSizes.lg, fontSizes.xl, fontSizes.xxl),
    fontWeight: 'bold',
    color: '#5252D7',
    fontFamily: 'NB International Pro Bold',
    marginBottom: responsive(spacing.xs / 2, spacing.xs, spacing.sm),
    textAlign: 'center',
    lineHeight: responsive(fontSizes.lg * 1.1, fontSizes.xl * 1.1, fontSizes.xxl * 1.1),
  },
  statLabel: {
    fontSize: responsive(fontSizes.xs, fontSizes.sm, fontSizes.md),
    color: '#A7A6A5',
    fontFamily: 'NB International Pro',
    textAlign: 'center',
    marginBottom: responsive(spacing.xs, spacing.sm, spacing.md),
    lineHeight: responsive(fontSizes.xs * 1.3, fontSizes.sm * 1.3, fontSizes.md * 1.3),
    paddingHorizontal: responsive(spacing.xs, spacing.sm, spacing.md),
  },
  statUnit: {
    fontSize: responsive(fontSizes.xs, fontSizes.sm, fontSizes.md),
    color: '#5252D7',
    fontFamily: 'NB International Pro',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: responsive(2, 4, 6),
    opacity: 0.8,
  },
  statsGridStacked: {
    flexDirection: 'column',
    gap: responsive(spacing.sm, spacing.md, spacing.lg),
  },
  statCardStacked: {
    flex: 0,
    width: '100%',
    maxWidth: '100%',
    minWidth: 'auto',
  },
  profitTokenContainer: {
    paddingHorizontal: safeAreaPadding.horizontal,
    marginBottom: spacing.lg,
  },
  profitTokenCard: {
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(82, 82, 215, 0.2)',
  },
  profitTokenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  profitTokenInfo: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  profitTokenName: {
    fontSize: responsive(fontSizes.md, fontSizes.lg, fontSizes.xl),
    fontFamily: 'NB International Pro',
    fontWeight: '600',
    marginBottom: 2,
  },
  profitTokenSymbol: {
    fontSize: responsive(fontSizes.sm, fontSizes.md, fontSizes.lg),
    fontFamily: 'NB International Pro',
    opacity: 0.7,
  },
  profitTokenBalance: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profitTokenBalanceLabel: {
    fontSize: responsive(fontSizes.sm, fontSizes.md, fontSizes.lg),
    fontFamily: 'NB International Pro',
    opacity: 0.8,
  },
  profitTokenBalanceValue: {
    fontSize: responsive(fontSizes.md, fontSizes.lg, fontSizes.xl),
    fontFamily: 'NB International Pro',
    fontWeight: '600',
  },
  dataSourceIndicator: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(82, 82, 215, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(82, 82, 215, 0.2)',
  },
  dataSourceText: {
    fontSize: responsive(fontSizes.xs, fontSizes.sm, fontSizes.md),
    fontFamily: 'NB International Pro',
    textAlign: 'center',
    opacity: 0.8,
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
