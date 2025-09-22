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
import { useLanguage } from '../contexts/LanguageContext'
import { useAccount } from 'wagmi'
import { useMachineInfo, useProfitTokenBalance } from '../contexts/MachineManagerContext'
import PeaqSharingTokenIcon from '../components/PeaqSharingTokenIcon'
import { SvgXml } from 'react-native-svg'
import SidebarLayout from '../components/SidebarLayout'
import NewHeader from '../components/NewHeader'

const { width, height } = Dimensions.get('window')

// SVG assets for profit token logo
const peaqLogoLightSvg = `<svg width="36" height="37" viewBox="0 0 36 37" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="0.5" y="1" width="35" height="35" rx="17.5" fill="#F8F7F6"/>
<rect x="0.5" y="1" width="35" height="35" rx="17.5" stroke="#EBE9E8"/>
<path d="M23.6097 13.5C23.5483 13.5 23.4869 13.5 23.4284 13.5C20.9072 13.5 19.4097 15.0683 18.3861 16.4324C17.9941 16.9561 17.6315 17.5086 17.2805 18.0439C16.6195 19.054 15.9965 20.0065 15.2624 20.6942C14.4844 21.4223 13.5075 21.8079 12.4371 21.8079C11.5655 21.7849 10.7524 21.4281 10.1499 20.8065C9.54444 20.1878 9.21101 19.3734 9.21101 18.5101C9.21394 17.6324 9.57369 16.7748 10.1996 16.1619C10.8343 15.5374 11.6766 15.195 12.5716 15.1921H12.5774C12.9401 15.1921 13.3701 15.264 13.7883 15.3964C13.8702 15.4223 13.9345 15.4827 13.9638 15.5662C13.993 15.6496 13.9784 15.7417 13.9258 15.8137L11.7468 18.8928C11.6825 18.9849 11.6766 19.1 11.7293 19.1978C11.7819 19.2957 11.8813 19.3561 11.9925 19.3561H13.2297C13.3964 19.3561 13.5543 19.2755 13.6479 19.1403L15.8971 15.9432C15.9877 15.8165 16.0462 15.6755 16.0784 15.523C16.1077 15.3705 16.1077 15.218 16.0755 15.0683C16.0433 14.9158 15.979 14.7777 15.8883 14.6511C15.7976 14.5245 15.6836 14.4209 15.549 14.3403C15.4584 14.2856 15.3648 14.2338 15.2653 14.182C14.4405 13.7417 13.5075 13.5086 12.5687 13.5086C11.2174 13.5086 9.94806 14.0295 8.99165 14.9705C8.04987 15.8971 7.50586 17.1863 7.50001 18.5101C7.49709 19.8108 8.00015 21.0424 8.91853 21.9777C9.83399 22.9187 11.0653 23.4597 12.3873 23.4942C13.8088 23.4942 15.0635 23.0108 16.2217 22.0209C17.2542 21.1345 18.0439 19.9835 18.7049 18.9763C19.2196 18.1906 19.7022 17.4511 20.2316 16.8381C20.4159 16.6223 20.5943 16.4381 20.7756 16.2712C21.577 15.5345 22.4223 15.1921 23.4343 15.1921C23.4781 15.1921 23.5191 15.1921 23.5629 15.1921C24.4345 15.2151 25.2476 15.5719 25.8501 16.1935C26.3707 16.7259 26.6983 17.4309 26.7744 18.1763C26.7861 18.2856 26.7919 18.3978 26.7919 18.5072C26.789 19.3906 26.438 20.2194 25.8033 20.8439C25.1687 21.4683 24.3263 21.8108 23.4313 21.8137H23.4255C22.9634 21.8137 22.5129 21.7043 22.2175 21.6122C22.1356 21.5863 22.0713 21.5259 22.0421 21.4424C22.0128 21.359 22.0274 21.2669 22.0801 21.1921L24.2503 18.1475C24.3146 18.0554 24.3234 17.9403 24.2707 17.8424C24.2181 17.7417 24.1187 17.6842 24.0046 17.6842H22.7703C22.6036 17.6842 22.4486 17.7647 22.3521 17.9L20.1058 21.0655C20.0152 21.1921 19.9567 21.3331 19.9245 21.4856C19.8953 21.6381 19.8953 21.7906 19.9274 21.9403C19.9596 22.0928 20.024 22.2309 20.1146 22.3576C20.2024 22.4784 20.3252 22.5906 20.4597 22.6712C20.5533 22.7259 20.6411 22.7777 20.7347 22.8266C21.5595 23.2669 22.4925 23.5 23.4313 23.5C24.7855 23.5 26.0549 22.9791 27.0113 22.0381C27.9677 21.0971 28.4971 19.8482 28.5 18.5158C28.5029 17.2209 27.9852 15.946 27.0785 15.0223C26.1631 14.0784 24.9317 13.5403 23.6097 13.5Z" fill="#6666FE"/>
</svg>`

const peaqLogoDarkSvg = `<svg width="36" height="37" viewBox="0 0 36 37" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="0.5" y="1" width="35" height="35" rx="17.5" fill="#2F1D74"/>
<rect x="0.5" y="1" width="35" height="35" rx="17.5" stroke="#6666FE"/>
<path d="M23.6097 13.5C23.5483 13.5 23.4869 13.5 23.4284 13.5C20.9072 13.5 19.4097 15.0683 18.3861 16.4324C17.9941 16.9561 17.6315 17.5086 17.2805 18.0439C16.6195 19.054 15.9965 20.0065 15.2624 20.6942C14.4844 21.4223 13.5075 21.8079 12.4371 21.8079C11.5655 21.7849 10.7524 21.4281 10.1499 20.8065C9.54444 20.1878 9.21101 19.3734 9.21101 18.5101C9.21394 17.6324 9.57369 16.7748 10.1996 16.1619C10.8343 15.5374 11.6766 15.195 12.5716 15.1921H12.5774C12.9401 15.1921 13.3701 15.264 13.7883 15.3964C13.8702 15.4223 13.9345 15.4827 13.9638 15.5662C13.993 15.6496 13.9784 15.7417 13.9258 15.8137L11.7468 18.8928C11.6825 18.9849 11.6766 19.1 11.7293 19.1978C11.7819 19.2957 11.8813 19.3561 11.9925 19.3561H13.2297C13.3964 19.3561 13.5543 19.2755 13.6479 19.1403L15.8971 15.9432C15.9877 15.8165 16.0462 15.6755 16.0784 15.523C16.1077 15.3705 16.1077 15.218 16.0755 15.0683C16.0433 14.9158 15.979 14.7777 15.8883 14.6511C15.7976 14.5245 15.6836 14.4209 15.549 14.3403C15.4584 14.2856 15.3648 14.2338 15.2653 14.182C14.4405 13.7417 13.5075 13.5086 12.5687 13.5086C11.2174 13.5086 9.94806 14.0295 8.99165 14.9705C8.04987 15.8971 7.50586 17.1863 7.50001 18.5101C7.49709 19.8108 8.00015 21.0424 8.91853 21.9777C9.83399 22.9187 11.0653 23.4597 12.3873 23.4942C13.8088 23.4942 15.0635 23.0108 16.2217 22.0209C17.2542 21.1345 18.0439 19.9835 18.7049 18.9763C19.2196 18.1906 19.7022 17.4511 20.2316 16.8381C20.4159 16.6223 20.5943 16.4381 20.7756 16.2712C21.577 15.5345 22.4223 15.1921 23.4343 15.1921C23.4781 15.1921 23.5191 15.1921 23.5629 15.1921C24.4345 15.2151 25.2476 15.5719 25.8501 16.1935C26.3707 16.7259 26.6983 17.4309 26.7744 18.1763C26.7861 18.2856 26.7919 18.3978 26.7919 18.5072C26.789 19.3906 26.438 20.2194 25.8033 20.8439C25.1687 21.4683 24.3263 21.8108 23.4313 21.8137H23.4255C22.9634 21.8137 22.5129 21.7043 22.2175 21.6122C22.1356 21.5863 22.0713 21.5259 22.0421 21.4424C22.0128 21.359 22.0274 21.2669 22.0801 21.1921L24.2503 18.1475C24.3146 18.0554 24.3234 17.9403 24.2707 17.8424C24.2181 17.7417 24.1187 17.6842 24.0046 17.6842H22.7703C22.6036 17.6842 22.4486 17.7647 22.3521 17.9L20.1058 21.0655C20.0152 21.1921 19.9567 21.3331 19.9245 21.4856C19.8953 21.6381 19.8953 21.7906 19.9274 21.9403C19.9596 22.0928 20.024 22.2309 20.1146 22.3576C20.2024 22.4784 20.3252 22.5906 20.4597 22.6712C20.5533 22.7259 20.6411 22.7777 20.7347 22.8266C21.5595 23.2669 22.4925 23.5 23.4313 23.5C24.7855 23.5 26.0549 22.9791 27.0113 22.0381C27.9677 21.0971 28.4971 19.8482 28.5 18.5158C28.5029 17.2209 27.9852 15.946 27.0785 15.0223C26.1631 14.0784 24.9317 13.5403 23.6097 13.5Z" fill="#6666FE"/>
</svg>`


type OwnershipScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Ownership'>
type OwnershipScreenRouteProp = RouteProp<RootStackParamList, 'Ownership'>

export default function OwnershipScreen() {
  const navigation = useNavigation<OwnershipScreenNavigationProp>()
  const route = useRoute<OwnershipScreenRouteProp>()
  const { machine } = route.params
  const { colors, isDarkMode } = useTheme()
  const { t } = useLanguage()
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
      backgroundColor: 'transparent',
    },
    title: {
      color: '#FFFFFF', // White text for better contrast on success background
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    },
    subtitle: {
      color: 'rgba(255, 255, 255, 0.9)', // Semi-transparent white for subtitle
      textShadowColor: 'rgba(0, 0, 0, 0.2)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    card: {
      backgroundColor: colors.card,
      borderColor: colors.border,
    },
    statCard: {
      backgroundColor: isDarkMode ? '#3A3A3A' : '#F8F7F6',
      borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    },
    profitTokenCard: {
      backgroundColor: isDarkMode ? '#2F1D74' : '#3D2B8A',
      borderColor: isDarkMode ? 'rgba(132, 132, 254, 0.3)' : 'rgba(132, 132, 254, 0.4)',
    },
    profitTokenName: {
      color: '#FFFFFF',
    },
    profitTokenSymbol: {
      color: 'rgba(255, 255, 255, 0.8)',
    },
    profitTokenBalanceLabel: {
      color: 'rgba(255, 255, 255, 0.7)',
    },
    profitTokenBalanceValue: {
      color: '#FFFFFF',
    },
    text: {
      color: colors.cardForeground,
    },
    textSecondary: {
      color: colors.mutedForeground,
    },
    successText: {
      color: colors.peaqPurple,
    },
    statusBadge: {
      backgroundColor: 'rgba(29, 131, 89, 0.1)',
      borderColor: 'rgba(29, 131, 89, 0.3)',
    },
    machineName: {
      color: colors.cardForeground,
    },
    machineAddress: {
      color: colors.mutedForeground,
    },
    buttonText: {
      color: colors.primaryForeground,
    },
    backButton: {
      backgroundColor: colors.peaqPurple,
    },
  }), [colors])

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
        {/* Main Content Wrapper */}
        <View style={styles.mainWrapper}>
          {/* Enhanced Success Hero Section */}
          <LinearGradient
            colors={isDarkMode 
              ? ['#10B981', '#34D399', '#6EE7B7'] // Success green gradient for dark mode
              : ['#059669', '#10B981', '#34D399'] // Deeper success green for light mode
            }
            style={styles.enhancedHeroSection}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
          {/* Decorative Elements */}
          <MotiView
            from={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.1, scale: 1 }}
            transition={{
              type: 'timing',
              duration: 2000,
            }}
            style={styles.decorativeCircle1}
          />
          <MotiView
            from={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.08, scale: 1 }}
            transition={{
              type: 'timing',
              duration: 2500,
              delay: 300,
            }}
            style={styles.decorativeCircle2}
          />
          <MotiView
            from={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.06, scale: 1 }}
            transition={{
              type: 'timing',
              duration: 3000,
              delay: 600,
            }}
            style={styles.decorativeCircle3}
          />

          {/* Main Hero Content */}
          <MotiView
            from={{ scale: 0, opacity: 0, translateY: 50 }}
            animate={{ scale: 1, opacity: 1, translateY: 0 }}
            transition={{
              type: 'spring',
              damping: 15,
              stiffness: 150,
            }}
          >
            <View style={styles.heroContent}>
              {/* Enhanced Success Icon with Animation */}
              <MotiView
                from={{ scale: 0, rotate: '-180deg' }}
                animate={{ scale: 1, rotate: '0deg' }}
                transition={{
                  type: 'spring',
                  damping: 10,
                  stiffness: 100,
                  delay: 500,
                }}
                style={styles.successIconContainer}
              >
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.1)']}
                  style={styles.successIconGradient}
                >
                  <Text style={styles.successIcon}>🎉</Text>
                </LinearGradient>
              </MotiView>
              
              {/* Animated Title */}
              <MotiView
                from={{ opacity: 0, translateY: 30 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{
                  type: 'timing',
                  duration: 800,
                  delay: 700,
                }}
              >
                <Text style={[styles.heroTitle, dynamicStyles.title]}>
{t('ownership.congratulations')} 
                </Text>
              </MotiView>
              
              {/* Animated Subtitle */}
              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{
                  type: 'timing',
                  duration: 800,
                  delay: 900,
                }}
              >
                <Text style={[styles.heroSubtitle, dynamicStyles.subtitle]}>
{t('ownership.successMessage')}
                </Text>
              </MotiView>

              {/* Success Particles Animation */}
              <MotiView
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  type: 'timing',
                  duration: 1000,
                  delay: 1200,
                }}
                style={styles.successParticles}
              >
                <Text style={styles.particle}>✨</Text>
                <Text style={styles.particle}>🌟</Text>
                <Text style={styles.particle}>💫</Text>
                <Text style={styles.particle}>⭐</Text>
                <Text style={styles.particle}>✨</Text>
              </MotiView>
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
                  {machine.type} {t('ownership.machine')}
                </Text>
                <View style={[styles.statusIndicator, dynamicStyles.statusBadge]}>
                  <Text style={styles.statusText}>{t('ownership.transactionComplete')}</Text>
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
            <View style={[styles.statCard, dynamicStyles.statCard]}>
              <Text style={[styles.statLabel, dynamicStyles.textSecondary]}>{t('ownership.pricePaid')}</Text>
              <Text style={[styles.statValue, dynamicStyles.text]}>
                {machineInfo?.price || machine.price}
              </Text>
              <Text style={[styles.statUnit, dynamicStyles.textSecondary]}>{t('units.peaq')}</Text>
            </View>
            
            <View style={[styles.statCard, dynamicStyles.statCard]}>
              <Text style={[styles.statLabel, dynamicStyles.textSecondary]}>{t('ownership.platformFee')}</Text>
              <Text style={[styles.statValue, dynamicStyles.text]}>
                {machineInfo?.platformFeeBps || machine.platformFeeBps}
              </Text>
              <Text style={[styles.statUnit, dynamicStyles.textSecondary]}>{t('units.bps')}</Text>
            </View>
          </MotiView>

          {/* Profit Sharing Token Section - Matching Machine Selection Design */}
          <MotiView
            from={{ opacity: 0, translateY: 30 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{
              type: 'timing',
              duration: 600,
              delay: 600,
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
{t('ownership.profitSharingToken')}
                </Text>
                <Text style={[styles.profitTokenSymbol, dynamicStyles.profitTokenSymbol]}>
{t('units.pft')}
                </Text>
              </View>
            </View>
            
            <View style={styles.profitTokenBalance}>
              <Text style={[styles.profitTokenBalanceLabel, dynamicStyles.profitTokenBalanceLabel]}>
{t('common.balance')}:
              </Text>
              <Text style={[styles.profitTokenBalanceValue, dynamicStyles.profitTokenBalanceValue]}>
                {peaqPFTBalanceLoading ? t('common.loading') : `${parseFloat(peaqPFTBalance || '0')} ${t('units.pft')}`}
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
              <Text style={[styles.backButtonIcon, dynamicStyles.buttonText]}>←</Text>
              <Text style={[styles.backButtonText, dynamicStyles.buttonText]}>
{t('nav.backToMachines')}
              </Text>
            </TouchableOpacity>
          </MotiView>
          
          {/* Bottom Spacer */}
          <View style={styles.bottomSpacer} />
        </View>
        </View>
      </div>
    </SidebarLayout>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainWrapper: {
    paddingTop: 0, // Remove top padding to extend success background to top
    paddingBottom: responsive(40, 50, 60),
  },
  heroSection: {
    paddingTop: responsive(100, 120, 140),
    paddingBottom: responsive(40, 50, 60),
    paddingHorizontal: responsive(20, 24, 28),
    justifyContent: 'center',
  },
  enhancedHeroSection: {
    paddingTop: 0, // Extend to top of screen
    paddingBottom: responsive(50, 60, 70),
    paddingHorizontal: responsive(20, 24, 28),
    justifyContent: 'center',
    minHeight: responsive(400, 450, 500),
    position: 'relative',
    overflow: 'hidden',
  },
  heroContent: {
    alignItems: 'center',
    paddingTop: responsive(80, 100, 120), // Safe area padding
  },
  successIconContainer: {
    width: responsive(100, 110, 120),
    height: responsive(100, 110, 120),
    borderRadius: responsive(50, 55, 60),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: responsive(24, 28, 32),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  successIconGradient: {
    width: '100%',
    height: '100%',
    borderRadius: responsive(50, 55, 60),
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIcon: {
    fontSize: responsive(48, 54, 60),
  },
  // Decorative Elements
  decorativeCircle1: {
    position: 'absolute',
    top: responsive(50, 60, 70),
    right: responsive(20, 30, 40),
    width: responsive(120, 140, 160),
    height: responsive(120, 140, 160),
    borderRadius: responsive(60, 70, 80),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  decorativeCircle2: {
    position: 'absolute',
    top: responsive(200, 220, 240),
    left: responsive(-20, -10, 0),
    width: responsive(80, 90, 100),
    height: responsive(80, 90, 100),
    borderRadius: responsive(40, 45, 50),
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  decorativeCircle3: {
    position: 'absolute',
    bottom: responsive(30, 40, 50),
    right: responsive(-30, -20, -10),
    width: responsive(150, 170, 190),
    height: responsive(150, 170, 190),
    borderRadius: responsive(75, 85, 95),
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  // Success Particles
  successParticles: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: responsive(20, 24, 28),
    gap: responsive(8, 10, 12),
  },
  particle: {
    fontSize: responsive(16, 18, 20),
    opacity: 0.8,
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
  profitTokenCard: {
    borderRadius: 16,
    padding: responsive(20, 24, 28),
    borderWidth: 1,
    marginBottom: responsive(20, 24, 28),
  },
  profitTokenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsive(16, 20, 24),
  },
  profitTokenInfo: {
    marginLeft: responsive(12, 16, 20),
    flex: 1,
  },
  profitTokenName: {
    fontSize: responsive(16, 18, 20),
    fontFamily: 'NB International Pro',
    fontWeight: '600',
    marginBottom: 2,
  },
  profitTokenSymbol: {
    fontSize: responsive(14, 16, 18),
    fontFamily: 'NB International Pro',
    opacity: 0.7,
  },
  profitTokenBalance: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profitTokenBalanceLabel: {
    fontSize: responsive(14, 16, 18),
    fontFamily: 'NB International Pro',
    opacity: 0.8,
  },
  profitTokenBalanceValue: {
    fontSize: responsive(16, 18, 20),
    fontFamily: 'NB International Pro',
    fontWeight: '600',
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
  },
  backButtonText: {
    fontSize: responsive(16, 18, 20),
    fontFamily: 'NB International Pro Bold',
  },
  bottomSpacer: {
    height: responsive(40, 50, 60),
  },
})