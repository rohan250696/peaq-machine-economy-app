import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, RefreshControl, Image, TouchableOpacity } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { MotiView } from 'moti'
import { useAccount, useBalance } from '../hooks/usePlatformWagmi'
import { usePrivy } from '../hooks/usePlatformAuth'
import { 
  useUserEarnings, 
  useTotalNetworkRevenue,
  useAllMachines
} from '../contexts/MachineManagerContext'
import { useTheme } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import { responsive, spacing, fontSizes } from '../utils/responsive'
import { shadows } from '../components/ResponsiveLayout'
import SidebarLayout from '../components/SidebarLayout'
import NewHeader from '../components/NewHeader'
import { SvgXml } from 'react-native-svg'
import * as Clipboard from 'expo-clipboard'
import { Alert } from 'react-native'

// Copy Address SVG
const copyAddressSvg = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M13.332 5.33301H6.66536C5.92898 5.33301 5.33203 5.92996 5.33203 6.66634V13.333C5.33203 14.0694 5.92898 14.6663 6.66536 14.6663H13.332C14.0684 14.6663 14.6654 14.0694 14.6654 13.333V6.66634C14.6654 5.92996 14.0684 5.33301 13.332 5.33301Z" stroke="currentColor" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M2.66536 10.6663C1.93203 10.6663 1.33203 10.0663 1.33203 9.33301V2.66634C1.33203 1.93301 1.93203 1.33301 2.66536 1.33301H9.33203C10.0654 1.33301 10.6654 1.93301 10.6654 2.66634" stroke="currentColor" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

// PEAQ Logo SVGs from assets
const peaqLogoLightSvg = `<svg width="36" height="37" viewBox="0 0 36 37" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="0.5" y="1" width="35" height="35" rx="17.5" fill="#F8F7F6"/>
<rect x="0.5" y="1" width="35" height="35" rx="17.5" stroke="#EBE9E8"/>
<path d="M23.6097 13.5C23.5483 13.5 23.4869 13.5 23.4284 13.5C20.9072 13.5 19.4097 15.0683 18.3861 16.4324C17.9941 16.9561 17.6315 17.5086 17.2805 18.0439C16.6195 19.054 15.9965 20.0065 15.2624 20.6942C14.4844 21.4223 13.5075 21.8079 12.4371 21.8079C11.5655 21.7849 10.7524 21.4281 10.1499 20.8065C9.54444 20.1878 9.21101 19.3734 9.21101 18.5101C9.21394 17.6324 9.57369 16.7748 10.1996 16.1619C10.8343 15.5374 11.6766 15.195 12.5716 15.1921H12.5774C12.9401 15.1921 13.3701 15.264 13.7883 15.3964C13.8702 15.4223 13.9345 15.4827 13.9638 15.5662C13.993 15.6496 13.9784 15.7417 13.9258 15.8137L11.7468 18.8928C11.6825 18.9849 11.6766 19.1 11.7293 19.1978C11.7819 19.2957 11.8813 19.3561 11.9925 19.3561H13.2297C13.3964 19.3561 13.5543 19.2755 13.6479 19.1403L15.8971 15.9432C15.9877 15.8165 16.0462 15.6755 16.0784 15.523C16.1077 15.3705 16.1077 15.218 16.0755 15.0683C16.0433 14.9158 15.979 14.7777 15.8883 14.6511C15.7976 14.5245 15.6836 14.4209 15.549 14.3403C15.4584 14.2856 15.3648 14.2338 15.2653 14.182C14.4405 13.7417 13.5075 13.5086 12.5687 13.5086C11.2174 13.5086 9.94806 14.0295 8.99165 14.9705C8.04987 15.8971 7.50586 17.1863 7.50001 18.5101C7.49709 19.8108 8.00015 21.0424 8.91853 21.9777C9.83399 22.9187 11.0653 23.4597 12.3873 23.4942C13.8088 23.4942 15.0635 23.0108 16.2217 22.0209C17.2542 21.1345 18.0439 19.9835 18.7049 18.9763C19.2196 18.1906 19.7022 17.4511 20.2316 16.8381C20.4159 16.6223 20.5943 16.4381 20.7756 16.2712C21.577 15.5345 22.4223 15.1921 23.4343 15.1921C23.4781 15.1921 23.5191 15.1921 23.5629 15.1921C24.4345 15.2151 25.2476 15.5719 25.8501 16.1935C26.3707 16.7259 26.6983 17.4309 26.7744 18.1763C26.7861 18.2856 26.7919 18.3978 26.7919 18.5072C26.789 19.3906 26.438 20.2194 25.8033 20.8439C25.1687 21.4683 24.3263 21.8108 23.4313 21.8137H23.4255C22.9634 21.8137 22.5129 21.7043 22.2175 21.6122C22.1356 21.5863 22.0713 21.5259 22.0421 21.4424C22.0128 21.359 22.0274 21.2669 22.0801 21.1921L24.2503 18.1475C24.3146 18.0554 24.3234 17.9403 24.2707 17.8424C24.2181 17.7417 24.1187 17.6842 24.0046 17.6842H22.7703C22.6036 17.6842 22.4486 17.7647 22.3521 17.9L20.1058 21.0655C20.0152 21.1921 19.9567 21.3331 19.9245 21.4856C19.8953 21.6381 19.8953 21.7906 19.9274 21.9403C19.9596 22.0928 20.024 22.2309 20.1146 22.3576C20.2024 22.4784 20.3252 22.5906 20.4597 22.6712C20.5533 22.7259 20.6411 22.7777 20.7347 22.8266C21.5595 23.2669 22.4925 23.5 23.4313 23.5C24.7855 23.5 26.0549 22.9791 27.0113 22.0381C27.9677 21.0971 28.4971 19.8482 28.5 18.5158C28.5029 17.2209 27.9852 15.946 27.0785 15.0223C26.1631 14.0784 24.9317 13.5403 23.6097 13.5Z" fill="#6666FE"/>
</svg>`

const peaqLogoDarkSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="24" height="24" rx="12" fill="#0F0E0D"/>
<path d="M15.7435 8.57129C15.7025 8.57129 15.6615 8.57129 15.6225 8.57129C13.9402 8.57129 12.941 9.64673 12.258 10.5821C11.9964 10.9412 11.7545 11.3201 11.5203 11.6871C11.0792 12.3797 10.6635 13.0329 10.1737 13.5045C9.65454 14.0037 9.00271 14.2681 8.28843 14.2681C7.70686 14.2524 7.16431 14.0077 6.76229 13.5814C6.35831 13.1572 6.13583 12.5988 6.13583 12.0068C6.13778 11.4049 6.37783 10.8169 6.79547 10.3966C7.21896 9.96837 7.78102 9.73355 8.3782 9.73158H8.38211C8.6241 9.73158 8.91099 9.78091 9.19006 9.87168C9.24471 9.88944 9.28764 9.93088 9.30716 9.9881C9.32668 10.0453 9.31692 10.1085 9.28179 10.1578L7.82786 12.2692C7.78492 12.3324 7.78102 12.4113 7.81615 12.4784C7.85127 12.5455 7.91763 12.5869 7.99179 12.5869H8.81731C8.92855 12.5869 9.03394 12.5317 9.09639 12.4389L10.5972 10.2466C10.6577 10.1598 10.6967 10.0631 10.7182 9.9585C10.7377 9.85392 10.7377 9.74934 10.7162 9.64673C10.6947 9.54214 10.6518 9.44742 10.5913 9.3606C10.5308 9.27378 10.4547 9.20274 10.3649 9.14749C10.3044 9.10999 10.242 9.07448 10.1756 9.03896C9.62527 8.73704 9.00271 8.57721 8.37625 8.57721C7.47462 8.57721 6.62763 8.93437 5.98946 9.57963C5.36105 10.215 4.99805 11.0991 4.99415 12.0068C4.9922 12.8987 5.32787 13.7433 5.94067 14.3846C6.55152 15.0298 7.37314 15.4008 8.25525 15.4245C9.20373 15.4245 10.041 15.093 10.8138 14.4142C11.5027 13.8064 12.0296 13.0171 12.4707 12.3264C12.8142 11.7877 13.1362 11.2806 13.4894 10.8603C13.6124 10.7123 13.7314 10.586 13.8524 10.4716C14.3871 9.9664 14.9512 9.73158 15.6264 9.73158C15.6557 9.73158 15.683 9.73158 15.7123 9.73158C16.2938 9.74736 16.8364 9.99205 17.2384 10.4183C17.5858 10.7833 17.8044 11.2668 17.8551 11.7779C17.8629 11.8529 17.8668 11.9298 17.8668 12.0048C17.8649 12.6106 17.6307 13.1789 17.2072 13.6071C16.7837 14.0353 16.2216 14.2701 15.6245 14.2721H15.6205C15.3122 14.2721 15.0117 14.1971 14.8145 14.134C14.7599 14.1162 14.717 14.0748 14.6974 14.0175C14.6779 13.9603 14.6877 13.8972 14.7228 13.8459L16.1709 11.7581C16.2138 11.695 16.2197 11.6161 16.1846 11.549C16.1494 11.4799 16.0831 11.4404 16.007 11.4404H15.1834C15.0722 11.4404 14.9687 11.4957 14.9043 11.5884L13.4055 13.759C13.345 13.8459 13.306 13.9426 13.2845 14.0471C13.265 14.1517 13.265 14.2563 13.2864 14.3589C13.3079 14.4635 13.3509 14.5582 13.4114 14.645C13.4699 14.7279 13.5519 14.8049 13.6416 14.8601C13.7041 14.8976 13.7626 14.9331 13.8251 14.9667C14.3754 15.2686 14.998 15.4284 15.6245 15.4284C16.528 15.4284 17.375 15.0713 18.0132 14.426C18.6514 13.7807 19.0046 12.9243 19.0066 12.0107C19.0085 11.1227 18.6631 10.2486 18.0581 9.61515C17.4472 8.96792 16.6256 8.59891 15.7435 8.57129Z" fill="#6666FE"/>
</svg>`

// SVG Icons
const earningsIconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
<circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
</svg>`

const networkIconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
<path d="M12 1V3" stroke="currentColor" stroke-width="2"/>
<path d="M12 21V23" stroke="currentColor" stroke-width="2"/>
<path d="M4.22 4.22L5.64 5.64" stroke="currentColor" stroke-width="2"/>
<path d="M18.36 18.36L19.78 19.78" stroke="currentColor" stroke-width="2"/>
<path d="M1 12H3" stroke="currentColor" stroke-width="2"/>
<path d="M21 12H23" stroke="currentColor" stroke-width="2"/>
<path d="M4.22 19.78L5.64 18.36" stroke="currentColor" stroke-width="2"/>
<path d="M18.36 5.64L19.78 4.22" stroke="currentColor" stroke-width="2"/>
</svg>`

export default function DashboardScreen() {
  const { address } = useAccount()
  const { data: balance } = useBalance({ address })
  const { authenticated, user: privyUser } = usePrivy()
  const { colors, isDarkMode } = useTheme()
  const { t } = useLanguage()
  const [refreshing, setRefreshing] = useState(false)

  // Extract user avatar from different authentication methods (from NewHeader)
  const getUserAvatar = () => {
    // Check Google authentication for avatar
    if (privyUser?.google && (privyUser.google as any)?.picture) {
      return (privyUser.google as any).picture
    }
    
    // Check Apple authentication for avatar
    if (privyUser?.apple && (privyUser.apple as any)?.picture) {
      return (privyUser.apple as any).picture
    }
    
    // Check Twitter authentication for avatar
    if (privyUser?.twitter && (privyUser.twitter as any)?.profile_picture_url) {
      return (privyUser.twitter as any).profile_picture_url
    }
    
    // No avatar found, use default
    return null
  }
  
  const userAvatar = getUserAvatar()

  // Extract user name and email from different authentication methods (from NewHeader)
  const getUserInfo = () => {
    // Check Google authentication
    if (privyUser?.google && (privyUser.google as any)?.name && (privyUser.google as any)?.email) {
      return {
        name: (privyUser.google as any).name,
        email: (privyUser.google as any).email
      }
    }
    
    // Check Apple authentication
    if (privyUser?.apple && (privyUser.apple as any)?.name && (privyUser.apple as any)?.email) {
      return {
        name: (privyUser.apple as any).name,
        email: (privyUser.apple as any).email
      }
    }
    
    // Check Twitter authentication
    if (privyUser?.twitter && (privyUser.twitter as any)?.name) {
      return {
        name: (privyUser.twitter as any).name,
        email: (privyUser.twitter as any).username || t('dashboard.twitterUser')
      }
    }
    
    // Fallback to linked accounts
    if (privyUser?.linkedAccounts && privyUser.linkedAccounts.length > 0) {
      const googleAccount = privyUser.linkedAccounts.find(account => account.type === 'google_oauth')
      if (googleAccount) {
        return {
          name: googleAccount.name,
          email: googleAccount.email
        }
      }
    }
    
    // Final fallback
    return {
      name: privyUser?.email?.address || privyUser?.phone?.number || t('dashboard.peaqUser'),
      email: address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '0x...'
    }
  }

  const userInfo = getUserInfo()

  // Copy address functionality
  const handleCopyAddress = async () => {
    try {
      if (address) {
        await Clipboard.setStringAsync(address)
        Alert.alert(t('header.copied'), t('header.copyAddress'))
      }
    } catch (error) {
      console.error('Copy failed:', error)
      Alert.alert(t('header.copyFailed'), t('common.tryAgain'))
    }
  }

  // Fetch user earnings data
  const { earnings: userEarnings, totalEarnings, isLoading: earningsLoading } = useUserEarnings(address)
  const { totalRevenue: networkRevenue, isLoading: networkLoading } = useTotalNetworkRevenue()
  const { machines, isLoading: machinesLoading } = useAllMachines()

  const handleRefresh = async () => {
    setRefreshing(true)
    // Refresh will happen automatically due to refetchInterval in hooks
    setTimeout(() => {
      setRefreshing(false)
    }, 1500)
  }

  const dynamicStyles = React.useMemo(() => StyleSheet.create({
    container: {
      backgroundColor: 'transparent',
    },
    statsCard: {
      backgroundColor: isDarkMode ? '#3A3A3A' : '#F8F7F6',
      borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    },
    title: {
      color: colors.foreground,
    },
    subtitle: {
      color: colors.mutedForeground,
    },
    cardTitle: {
      color: colors.foreground,
    },
    cardValue: {
      color: isDarkMode ? colors.peaqPurple : '#2F1D74',
    },
    cardLabel: {
      color: isDarkMode ? colors.mutedForeground : '#5B5A59',
    },
    cardUnit: {
      color: isDarkMode ? colors.peaqPurple : '#2F1D74',
    },
    cardIconContainer: {
      backgroundColor: isDarkMode ? colors.peaqActionBg : 'rgba(102, 102, 254, 0.1)',
      borderColor: isDarkMode ? colors.peaqPurple : 'rgba(102, 102, 254, 0.2)',
    },
    machineEarningsCard: {
      backgroundColor: isDarkMode ? '#2F1D74' : '#3D2B8A',
      borderColor: isDarkMode ? 'rgba(132, 132, 254, 0.3)' : 'rgba(132, 132, 254, 0.4)',
    },
    machineCardName: {
      color: '#FFFFFF',
    },
    machineCardType: {
      color: 'rgba(255, 255, 255, 0.8)',
    },
    machineCardAddress: {
      color: 'rgba(255, 255, 255, 0.7)',
    },
    machineEarningsLabel: {
      color: 'rgba(255, 255, 255, 0.7)',
    },
    machineEarningsValue: {
      color: '#FFFFFF',
    },
    portalLogoCircle: {
      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)',
    },
    portalUserName: {
      color: isDarkMode ? colors.foreground : '#FFFFFF',
    },
    portalAddress: {
      color: isDarkMode ? colors.mutedForeground : 'rgba(255, 255, 255, 0.8)',
    },
    portalBalanceValue: {
      color: isDarkMode ? colors.foreground : '#FFFFFF',
    },
    portalBalanceUnit: {
      color: isDarkMode ? colors.mutedForeground : 'rgba(255, 255, 255, 0.8)',
    },
    gradientBlob1: {
      backgroundColor: isDarkMode ? 'rgba(82, 41, 205, 0.9)' : 'rgba(82, 41, 205, 1)',
      shadowColor: '#5229CD',
      shadowOpacity: 1,
      shadowRadius: responsive(70, 85, 100),
      elevation: 25,
      opacity: isDarkMode ? 0.7 : 0.9,
    },
    gradientBlob2: {
      backgroundColor: isDarkMode ? 'rgba(255, 245, 254, 0.8)' : 'rgba(255, 245, 254, 1)',
      shadowColor: '#FFF5FE',
      shadowOpacity: 1,
      shadowRadius: responsive(65, 80, 95),
      elevation: 20,
      opacity: isDarkMode ? 0.4 : 0.8,
    },
    gradientBlob3: {
      backgroundColor: isDarkMode ? 'rgba(139, 92, 246, 0.7)' : 'rgba(168, 85, 247, 0.9)',
      shadowColor: isDarkMode ? '#8B5CF6' : '#A855F7',
      shadowOpacity: 1,
      shadowRadius: responsive(80, 95, 110),
      elevation: 15,
      opacity: isDarkMode ? 0.5 : 0.7,
    },
  }), [colors, isDarkMode])

  if (!authenticated || !address) {
  return (
      <SidebarLayout>
        <NewHeader />
        <View style={[styles.container, dynamicStyles.container, styles.centerContainer]}>
          <Text style={[styles.title, dynamicStyles.title]}>Please connect your wallet</Text>
        </View>
      </SidebarLayout>
    )
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
        <ScrollView
          style={[styles.container, dynamicStyles.container]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
        {/* Header */}
        <MotiView
          from={{ opacity: 0, translateY: -30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
              type: 'spring',
              damping: 20,
              stiffness: 300,
            }}
            style={[styles.header, { paddingTop: responsive(90, 100, 110) }]}
          >
            <Text style={[styles.title, dynamicStyles.title]}>{t('nav.dashboard')}</Text>
            <Text style={[styles.subtitle, dynamicStyles.subtitle]}>
{t('dashboard.subtitle')}
                          </Text>
        </MotiView>

          {/* Stats Grid */}
          <View style={styles.statsContainer}>
            {/* User Total PFT Earnings */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
                type: 'spring',
                damping: 20,
                stiffness: 300,
                delay: 100,
              }}
              style={[styles.statsCard, dynamicStyles.statsCard]}
            >
              <View style={styles.cardContent}>
                <View style={[styles.cardIconContainer, dynamicStyles.cardIconContainer]}>
                  <SvgXml 
                    xml={earningsIconSvg} 
                    width={responsive(20, 24, 28)} 
                    height={responsive(20, 24, 28)}
                    color={dynamicStyles.cardValue.color}
                  />
                </View>
                <Text style={[styles.cardLabel, dynamicStyles.cardLabel]}>{t('dashboard.totalPftEarnings')}</Text>
                <Text style={[styles.cardValue, dynamicStyles.cardValue]}>
                  {earningsLoading ? '...' : totalEarnings}
                </Text>
                <Text style={[styles.cardUnit, dynamicStyles.cardUnit]}>PFT</Text>
          </View>
        </MotiView>

            {/* Live Network Revenue */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
                type: 'spring',
                damping: 20,
                stiffness: 300,
            delay: 200,
          }}
              style={[styles.statsCard, dynamicStyles.statsCard]}
            >
              <View style={styles.cardContent}>
                <View style={[styles.cardIconContainer, dynamicStyles.cardIconContainer]}>
                  <SvgXml 
                    xml={networkIconSvg} 
                    width={responsive(20, 24, 28)} 
                    height={responsive(20, 24, 28)}
                    color={dynamicStyles.cardValue.color}
                  />
          </View>
                <Text style={[styles.cardLabel, dynamicStyles.cardLabel]}>{t('dashboard.networkRevenue')}</Text>
                <Text style={[styles.cardValue, dynamicStyles.cardValue]}>
                  {networkLoading ? '...' : networkRevenue}
          </Text>
                <Text style={[styles.cardUnit, dynamicStyles.cardUnit]}>PEAQ</Text>
          </View>
        </MotiView>
          </View>
          
          {/* Portal Wallet Style PEAQ Balance Card */}
          <View style={styles.portalCardContainer}>
        <MotiView
              from={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
          transition={{
                type: 'spring',
                damping: 20,
                stiffness: 300,
            delay: 400,
          }}
              style={styles.portalCard}
            >
              {/* Background with gradient and blur effects */}
              <View style={styles.portalBackgroundContainer}>
                {/* Base gradient background */}
                <LinearGradient
                  colors={isDarkMode 
                    ? ['#2D1B69', '#1F2937', '#374151']
                    : ['#5B21B6', '#7C3AED', '#8B5CF6']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.portalGradientBackground}
                />
                
                {/* Gradient blob effects */}
                <View style={styles.portalBlobsContainer}>
                  {/* Blob 1 - Large purple effect (top-left) */}
                  <View style={[styles.gradientBlob1, dynamicStyles.gradientBlob1]} />
                  
                  {/* Blob 2 - Light accent effect (top-right) */}
                  <View style={[styles.gradientBlob2, dynamicStyles.gradientBlob2]} />
                  
                  {/* Blob 3 - Background effect (bottom) */}
                  <View style={[styles.gradientBlob3, dynamicStyles.gradientBlob3]} />
          </View>
              </View>
              
              {/* Card Content Overlay */}
              <View style={styles.portalCardContent}>
                {/* Top Row */}
                <View style={styles.portalTopRow}>
                  {/* Left - User Avatar or PEAQ Logo */}
                  <View style={styles.portalLogoContainer}>
                    <View style={[styles.portalLogoCircle, dynamicStyles.portalLogoCircle]}>
                      {userAvatar ? (
                        <Image 
                          source={{ uri: userAvatar }} 
                          style={styles.portalAvatar} 
                          resizeMode="cover" 
                        />
                      ) : (
                        <SvgXml 
                          xml={isDarkMode ? peaqLogoDarkSvg : peaqLogoLightSvg} 
                          width={responsive(24, 28, 32)} 
                          height={responsive(24, 28, 32)}
                        />
                      )}
              </View>
              </View>
              
                  {/* Right - Balance */}
                  <View style={styles.portalBalanceContainer}>
                    <Text style={[styles.portalBalanceValue, dynamicStyles.portalBalanceValue]}>
                      {balance ? parseFloat(balance.formatted).toFixed(2) : '0.00'}
                    </Text>
                    <Text style={[styles.portalBalanceUnit, dynamicStyles.portalBalanceUnit]}>PEAQ</Text>
              </View>
            </View>
            
                {/* Bottom - User Info */}
                <View style={styles.portalBottomSection}>
                  <Text style={[styles.portalUserName, dynamicStyles.portalUserName]} numberOfLines={1}>
                    {userInfo.name}
                  </Text>
                  <Text style={[styles.portalUserEmail, dynamicStyles.portalAddress]} numberOfLines={1}>
                    {userInfo.email}
                  </Text>
            <TouchableOpacity 
                    style={styles.portalAddressRow}
                    onPress={handleCopyAddress}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.portalWalletAddress, dynamicStyles.portalAddress]} numberOfLines={1}>
                      {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '0x...'}
                    </Text>
                    <SvgXml 
                      xml={copyAddressSvg} 
                      width={responsive(12, 14, 16)} 
                      height={responsive(12, 14, 16)}
                      color={dynamicStyles.portalAddress.color}
                    />
            </TouchableOpacity>
                </View>
          </View>
        </MotiView>
          </View>

          {/* PFT Earnings Per Machine */}
          <View style={styles.earningsContainer}>
        <MotiView
              from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
                type: 'spring',
                damping: 20,
                stiffness: 300,
                delay: 500,
              }}
            >
              <Text style={[styles.sectionTitle, dynamicStyles.title]}>{t('dashboard.pftEarningsPerMachine')}</Text>
              <Text style={[styles.sectionSubtitle, dynamicStyles.subtitle]}>
{t('dashboard.earningsBreakdown')}
              </Text>
        </MotiView>

            {machines.map((machine, index) => {
              const machineEarnings = userEarnings[index] || '0'
              const isRoboCafe = machine.name?.toLowerCase().includes('robocafe') || machine.name?.toLowerCase().includes('coffee')
            
            return (
              <MotiView
                  key={`machine-${index}`}
                  from={{ opacity: 0, translateY: 20, scale: 0.95 }}
                  animate={{ opacity: 1, translateY: 0, scale: 1 }}
                transition={{
                    type: 'spring',
                    damping: 20,
                    stiffness: 300,
                    delay: 600 + index * 100,
                  }}
                  style={[styles.machineEarningsCard, dynamicStyles.machineEarningsCard]}
                >
                  <View style={styles.machineCardHeader}>
                    <View style={styles.machineImageContainer}>
                      <Image 
                        source={
                          isRoboCafe
                            ? require('../../assets/coffee-robo-image.png')
                            : require('../../assets/humanoid.png')
                        }
                        style={styles.machineImage}
                        resizeMode="cover"
                      />
                  </View>
                    <View style={styles.machineCardInfo}>
                      <Text style={[styles.machineCardName, dynamicStyles.machineCardName]}>
                        {machine.name || `Machine ${index}`}
                      </Text>
                      <Text style={[styles.machineCardType, dynamicStyles.machineCardType]}>
                        {isRoboCafe ? '☕ RoboCafe' : '🤖 Humanoid'}
                      </Text>
                      <Text style={[styles.machineCardAddress, dynamicStyles.machineCardAddress]}>
                        📍 {machine.machineAddr ? `${machine.machineAddr.slice(0, 8)}...${machine.machineAddr.slice(-6)}` : 'N/A'}
                      </Text>
                    </View>
                    </View>
                    
                  <View style={styles.machineCardEarnings}>
                    <Text style={[styles.machineEarningsLabel, dynamicStyles.machineEarningsLabel]}>
{t('dashboard.userPftEarnings')}:
                    </Text>
                    <Text style={[styles.machineEarningsValue, dynamicStyles.machineEarningsValue]}>
                      {earningsLoading ? t('common.loading') : `${parseFloat(machineEarnings).toFixed()} PFT`}
                      </Text>
                </View>
              </MotiView>
            )
          })}

            {machines.length === 0 && !machinesLoading && (
        <MotiView
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
          transition={{
            type: 'timing',
                  duration: 500,
                  delay: 600,
                }}
                style={[styles.emptyCard, dynamicStyles.statsCard]}
              >
                <Text style={[styles.emptyText, dynamicStyles.subtitle]}>
{t('dashboard.noMachines')}
                      </Text>
        </MotiView>
            )}
          </View>
        </ScrollView>
    </div>
    </SidebarLayout>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: responsive(spacing.lg, spacing.xl, spacing.xxl),
    paddingBottom: responsive(spacing.lg, spacing.xl, spacing.xxl),
  },
  title: {
    fontSize: responsive(fontSizes.xxl, fontSizes.title, fontSizes.largeTitle),
    fontFamily: 'NB International Pro Bold',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: responsive(spacing.xs, spacing.sm, spacing.md),
    lineHeight: responsive(fontSizes.xxl * 1.2, fontSizes.title * 1.2, fontSizes.largeTitle * 1.2),
  },
  subtitle: {
    fontSize: responsive(fontSizes.sm, fontSizes.md, fontSizes.lg),
    fontFamily: 'NB International Pro',
    textAlign: 'center',
    lineHeight: responsive(fontSizes.sm * 1.3, fontSizes.md * 1.3, fontSizes.lg * 1.3),
    opacity: 0.8,
  },
  statsContainer: {
    paddingHorizontal: responsive(spacing.md, spacing.lg, spacing.xl),
    marginBottom: responsive(spacing.lg, spacing.xl, spacing.xxl),
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: responsive(spacing.md, spacing.lg, spacing.xl),
    justifyContent: 'space-between',
  },
  statsCard: {
    flex: 1,
    minWidth: responsive(140, 160, 180),
    maxWidth: responsive(200, 220, 250),
    borderRadius: responsive(16, 18, 20),
    padding: responsive(spacing.lg, spacing.xl, spacing.xxl),
    borderWidth: 1,
    alignItems: 'center',
    ...shadows.medium,
  },
  cardContent: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: responsive(60, 80, 100),
  },
  cardIconContainer: {
    width: responsive(40, 48, 56),
    height: responsive(40, 48, 56),
    borderRadius: responsive(20, 24, 28),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: responsive(spacing.sm, spacing.md, spacing.lg),
    borderWidth: 1,
    ...shadows.small,
  },
  cardLabel: {
    fontSize: responsive(fontSizes.xs, fontSizes.sm, fontSizes.md),
    fontFamily: 'NB International Pro',
    textAlign: 'center',
    marginBottom: responsive(spacing.xs, spacing.sm, spacing.md),
    lineHeight: responsive(fontSizes.xs * 1.3, fontSizes.sm * 1.3, fontSizes.md * 1.3),
    paddingHorizontal: responsive(spacing.xs, spacing.sm, spacing.md),
  },
  cardValue: {
    fontSize: responsive(fontSizes.lg, fontSizes.xl, fontSizes.xxl),
    fontFamily: 'NB International Pro Bold',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: responsive(spacing.xs / 2, spacing.xs, spacing.sm),
    lineHeight: responsive(fontSizes.lg * 1.1, fontSizes.xl * 1.1, fontSizes.xxl * 1.1),
  },
  cardUnit: {
    fontSize: responsive(fontSizes.xs, fontSizes.sm, fontSizes.md),
    fontFamily: 'NB International Pro',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: responsive(2, 4, 6),
    opacity: 0.8,
  },
  earningsContainer: {
    paddingHorizontal: responsive(spacing.md, spacing.lg, spacing.xl),
    paddingBottom: responsive(spacing.xl, spacing.xxl, spacing.xxxl),
  },
  sectionTitle: {
    fontSize: responsive(fontSizes.lg, fontSizes.xl, fontSizes.xxl),
    fontFamily: 'NB International Pro Bold',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: responsive(spacing.xs, spacing.sm, spacing.md),
  },
  sectionSubtitle: {
    fontSize: responsive(fontSizes.sm, fontSizes.md, fontSizes.lg),
    fontFamily: 'NB International Pro',
    textAlign: 'center',
    marginBottom: responsive(spacing.lg, spacing.xl, spacing.xxl),
    opacity: 0.8,
  },
  machineEarningsCard: {
    borderRadius: responsive(16, 18, 20),
    padding: responsive(spacing.lg, spacing.xl, spacing.xxl),
    marginBottom: responsive(spacing.lg, spacing.xl, spacing.xxl),
    borderWidth: 1,
    ...shadows.medium,
  },
  machineCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsive(spacing.md, spacing.lg, spacing.xl),
    gap: responsive(spacing.sm, spacing.md, spacing.lg),
  },
  machineImageContainer: {
    width: responsive(48, 56, 64),
    height: responsive(48, 56, 64),
    borderRadius: responsive(12, 14, 16),
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  machineImage: {
    width: '100%',
    height: '100%',
  },
  machineCardInfo: {
    flex: 1,
  },
  machineCardName: {
    fontSize: responsive(fontSizes.md, fontSizes.lg, fontSizes.xl),
    fontFamily: 'NB International Pro Bold',
    fontWeight: '700',
    marginBottom: responsive(2, 3, 4),
  },
  machineCardType: {
    fontSize: responsive(fontSizes.sm, fontSizes.md, fontSizes.lg),
    fontFamily: 'NB International Pro',
    marginBottom: responsive(2, 3, 4),
  },
  machineCardAddress: {
    fontSize: responsive(fontSizes.xs, fontSizes.sm, fontSizes.md),
    fontFamily: 'NB International Pro',
  },
  machineCardEarnings: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  machineEarningsLabel: {
    fontSize: responsive(fontSizes.sm, fontSizes.md, fontSizes.lg),
    fontFamily: 'NB International Pro',
  },
  machineEarningsValue: {
    fontSize: responsive(fontSizes.md, fontSizes.lg, fontSizes.xl),
    fontFamily: 'NB International Pro Bold',
    fontWeight: '700',
  },
  // Portal Wallet Style Card
  portalCardContainer: {
    paddingHorizontal: responsive(spacing.md, spacing.lg, spacing.xl),
    marginBottom: responsive(spacing.lg, spacing.xl, spacing.xxl),
  },
  portalCard: {
    width: '100%',
    minHeight: responsive(200, 220, 250),
    height: 'auto', // Dynamic height based on content
    borderRadius: responsive(20, 24, 28),
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: 'transparent',
    ...shadows.large,
  },
  portalBackgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  portalGradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  portalBlobsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  gradientBlob1: {
    position: 'absolute',
    width: responsive(320, 380, 478),
    height: responsive(167, 200, 250),
    borderRadius: responsive(160, 190, 239),
    top: responsive(-80, -100, -125),
    left: responsive(-100, -120, -150),
    transform: [{ scale: 1.2 }, { rotate: '15deg' }],
  },
  gradientBlob2: {
    position: 'absolute',
    width: responsive(213, 256, 320),
    height: responsive(120, 144, 181),
    borderRadius: responsive(106, 128, 160),
    top: responsive(-40, -50, -60),
    right: responsive(-80, -100, -120),
    transform: [{ scale: 1.1 }, { rotate: '-10deg' }],
  },
  gradientBlob3: {
    position: 'absolute',
    width: responsive(399, 479, 598),
    height: responsive(167, 200, 250),
    borderRadius: responsive(199, 239, 299),
    bottom: responsive(-100, -120, -150),
    left: responsive(-120, -150, -200),
    transform: [{ scale: 1.3 }, { rotate: '25deg' }],
  },
  portalCardContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: responsive(spacing.lg, spacing.xl, spacing.xxl),
    justifyContent: 'space-between',
    zIndex: 2,
    minHeight: responsive(200, 220, 250),
  },
  portalTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: responsive(spacing.md, spacing.lg, spacing.xl),
  },
  portalBottomSection: {
    justifyContent: 'flex-end',
    flex: 1,
  },
  portalLogoContainer: {
    alignItems: 'flex-start',
  },
  portalLogoCircle: {
    width: responsive(48, 56, 64),
    height: responsive(48, 56, 64),
    borderRadius: responsive(24, 28, 32),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    ...shadows.medium,
  },
  portalBalanceContainer: {
    alignItems: 'flex-end',
  },
  portalBalanceValue: {
    fontSize: responsive(fontSizes.xl, fontSizes.xxl, fontSizes.xxxl),
    fontFamily: 'NB International Pro Bold',
    fontWeight: '700',
    lineHeight: responsive(fontSizes.xl * 1.1, fontSizes.xxl * 1.1, fontSizes.xxxl * 1.1),
  },
  portalBalanceUnit: {
    fontSize: responsive(fontSizes.sm, fontSizes.md, fontSizes.lg),
    fontFamily: 'NB International Pro',
    opacity: 0.8,
    marginTop: responsive(spacing.xs / 4, spacing.xs / 2, spacing.xs),
  },
  portalAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: responsive(spacing.xs, spacing.sm, spacing.md),
    paddingVertical: responsive(spacing.xs / 2, spacing.xs, spacing.sm),
    paddingHorizontal: responsive(spacing.xs, spacing.sm, spacing.md),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: responsive(6, 8, 10),
    marginTop: responsive(spacing.xs, spacing.sm, spacing.md),
    alignSelf: 'flex-start',
  },
  portalAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: responsive(24, 28, 32),
  },
  portalUserName: {
    fontSize: responsive(fontSizes.lg, fontSizes.xl, fontSizes.xxl),
    fontFamily: 'NB International Pro Bold',
    fontWeight: '700',
    marginBottom: responsive(spacing.xs / 2, spacing.xs, spacing.sm),
    lineHeight: responsive(fontSizes.lg * 1.2, fontSizes.xl * 1.2, fontSizes.xxl * 1.2),
  },
  portalUserEmail: {
    fontSize: responsive(fontSizes.sm, fontSizes.md, fontSizes.lg),
    fontFamily: 'NB International Pro',
    lineHeight: responsive(fontSizes.sm * 1.3, fontSizes.md * 1.3, fontSizes.lg * 1.3),
    marginBottom: responsive(spacing.xs, spacing.sm, spacing.md),
    opacity: 0.8,
  },
  portalAddress: {
    fontSize: responsive(fontSizes.sm, fontSizes.md, fontSizes.lg),
    fontFamily: 'NB International Pro',
    lineHeight: responsive(fontSizes.sm * 1.3, fontSizes.md * 1.3, fontSizes.lg * 1.3),
    marginBottom: responsive(spacing.xs / 2, spacing.xs, spacing.sm),
  },
  portalWalletAddress: {
    fontSize: responsive(fontSizes.xs, fontSizes.sm, fontSizes.md),
    fontFamily: 'NB International Pro',
    fontWeight: '600',
    lineHeight: responsive(fontSizes.xs * 1.3, fontSizes.sm * 1.3, fontSizes.md * 1.3),
    opacity: 0.8,
  },
  emptyCard: {
    padding: responsive(spacing.xl, spacing.xxl, spacing.xxxl),
    alignItems: 'center',
    borderRadius: responsive(16, 18, 20),
    borderWidth: 1,
    marginTop: responsive(spacing.lg, spacing.xl, spacing.xxl),
  },
  emptyText: {
    fontSize: responsive(fontSizes.sm, fontSizes.md, fontSizes.lg),
    fontFamily: 'NB International Pro',
    textAlign: 'center',
    lineHeight: responsive(fontSizes.sm * 1.4, fontSizes.md * 1.4, fontSizes.lg * 1.4),
  },
})