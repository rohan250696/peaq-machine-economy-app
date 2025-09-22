import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Platform } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { MotiView } from 'moti'
import { Machine } from '../types'
import { useAccount } from 'wagmi'
import { useMachineManager } from '../contexts/MachineManagerContext'
import { useTheme } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import { 
  spacing, 
  fontSizes, 
  responsive, 
  getCardWidth, 
  glassmorphism, 
  shadows,
  isMobile,
  isTablet,
  isDesktop
} from './ResponsiveLayout'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

interface MachineCardProps {
  machine: Machine
  index: number
  onPress: (machine: Machine) => void
  onCopyAddress: (address: string) => void
  columns?: number
  isLoading?: boolean
}

export default function MachineCard({ 
  machine, 
  index, 
  onPress, 
  onCopyAddress,
  columns = 1,
  isLoading = false
}: MachineCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [hasEnoughBalance, setHasEnoughBalance] = useState<boolean | null>(null)
  const cardWidth = getCardWidth(columns)
  const isGridLayout = columns > 1
  const { address } = useAccount()
  const { getTokenBalance } = useMachineManager()
  const { colors, isDarkMode } = useTheme()
  const { t } = useLanguage()

  // Check if user has enough PEAQ balance
  useEffect(() => {
    const checkBalance = async () => {
      if (!address || !machine.price) {
        setHasEnoughBalance(null)
        return
      }

      try {
        const balance = await getTokenBalance(address)
        const requiredAmount = parseFloat(machine.price.toString())
        const userBalance = parseFloat(balance)
        setHasEnoughBalance(userBalance >= requiredAmount)
      } catch (error) {
        console.error('Error checking balance:', error)
        setHasEnoughBalance(null)
      }
    }

    checkBalance()
  }, [address, machine.price, getTokenBalance])

  // Create dynamic styles based on theme
  const dynamicStyles = React.useMemo(() => StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderColor: colors.border,
    },
    category: {
      color: 'rgba(255, 255, 255, 0.8)',
    },
    productName: {
      color: '#FFFFFF',
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    description: {
      color: 'rgba(255, 255, 255, 0.9)',
    },
    featureText: {
      color: 'rgba(255, 255, 255, 0.9)',
    },
    mainPrice: {
      color: '#FFFFFF',
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    priceDescription: {
      color: 'rgba(255, 255, 255, 0.8)',
    },
    earningsTitle: {
      color: '#FFFFFF',
    },
    legendText: {
      color: 'rgba(255, 255, 255, 0.7)',
    },
    addressLabel: {
      color: 'rgba(255, 255, 255, 0.8)',
    },
    walletLabel: {
      color: colors.mutedForeground,
    },
    walletAddress: {
      color: colors.peaqPurple,
    },
  }), [colors])

  const isDisabled = false // Allow clicking even with insufficient balance

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: 'spring',
        damping: 15,
        stiffness: 150,
        delay: index * 100,
      }}
      style={[
        styles.container,
        { width: isGridLayout ? cardWidth : '100%' },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.card,
          isHovered && styles.cardHovered
        ]}
        onPress={() => onPress(machine)}
        activeOpacity={0.8}
        {...(Platform.OS === 'web' && {
          onMouseEnter: () => setIsHovered(true),
          onMouseLeave: () => setIsHovered(false),
        })}
      >
        {/* Portal Wallet Style Gradient Background */}
        <LinearGradient
          colors={isDarkMode 
            ? ['#4C1D95', '#6D28D9', '#8B5CF6', '#A78BFA'] // Dark theme: deeper purples
            : ['#5B21B6', '#7C3AED', '#8B5CF6', '#A855F7'] // Light theme: vibrant purples
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBackground}
        >
          {/* Decorative 3D Cylinders */}
          <View style={styles.decorativeElements}>
            <View style={[styles.cylinder, styles.cylinder1]} />
            <View style={[styles.cylinder, styles.cylinder2]} />
          </View>
          
          {/* Content Overlay */}
          <View style={styles.contentOverlay}>
            
            {/* Top Icon Circle (like Portal Wallet) */}
            <View style={styles.topIconContainer}>
              <View style={styles.iconCircle}>
                <Text style={styles.iconText}>
                  {machine.type === 'RoboCafe' ? '☕' : '🤖'}
                </Text>
              </View>
            </View>
            
        {/* Product Image Section */}
        <View style={styles.imageSection}>
          <Image 
            source={
              machine.image?.includes('coffee-robo-image.png') || machine.type === 'RoboCafe'
                ? require('../../assets/coffee-robo-image.png')
                : require('../../assets/humanoid.png')
            }
            style={styles.productImage}
            resizeMode="cover"
          />
          
          {/* Status Badge */}
          <View style={[
            styles.statusBadge,
            { backgroundColor: machine.isActive ? '#10B981' : '#EF4444' }
          ]}>
            <Text style={styles.statusText}>
{machine.isActive ? t('machines.active') : t('machines.inactive')}
            </Text>
          </View>
          
          {/* Hot Sale Badge for Active Machines */}
          {machine.isActive && machine.revenue > 10 && (
            <View style={styles.hotSaleBadge}>
              <Text style={styles.hotSaleText}>{t('machines.hotSale')}</Text>
            </View>
          )}
        </View>

        {/* Product Info Section */}
        <View style={styles.productInfo}>
          {/* Category */}
          <Text style={[styles.category, dynamicStyles.category]}>peaq MACHINE</Text>
          
          {/* Product Name */}
          <Text style={[styles.productName, dynamicStyles.productName]} numberOfLines={2}>
            {machine.type === 'RoboCafe' ? '☕ ' : '🤖 '}{machine.name}
          </Text>
          
          {/* Description */}
          <Text style={[styles.description, dynamicStyles.description]} numberOfLines={2}>
            {machine.type} • {machine.location.name}
          </Text>
          
          {/* Machine Address */}
          {machine.address && (
            <TouchableOpacity 
              style={styles.addressContainer}
              onPress={() => onCopyAddress(machine.address)}
              activeOpacity={0.7}
            >
              <Text style={[styles.addressLabel, dynamicStyles.addressLabel]}>
                📍 {machine.address.slice(0, 8)}...{machine.address.slice(-6)}
              </Text>
            </TouchableOpacity>
          )}
          
          {/* Features Tags */}
          <View style={styles.featuresContainer}>
            <View style={styles.featureTag}>
              <Text style={[styles.featureText, dynamicStyles.featureText]}>Live Revenue</Text>
            </View>
            <View style={styles.featureTag}>
              <Text style={[styles.featureText, dynamicStyles.featureText]}>peaq Network</Text>
            </View>
            <View style={styles.featureTag}>
              <Text style={[styles.featureText, dynamicStyles.featureText]}>Decentralized</Text>
            </View>
          </View>
          
          {/* Main Price Display */}
          <View style={styles.mainPriceSection}>
            <Text style={[styles.mainPrice, dynamicStyles.mainPrice]}>
              {isLoading ? t('common.loading') : machine.price ? `${machine.price} ${t('units.peaq')}` : `${machine.revenue.toFixed(2)} ${t('units.peaq')}`}
            </Text>
            <Text style={[styles.priceDescription, dynamicStyles.priceDescription]}>
              {machine.type === 'RoboCafe' ? t('machines.coffeeCost') : t('machines.interactionCost')}
            </Text>
          </View>
          
          
          {/* Balance Indicator */}
          {/* {machine.price && hasEnoughBalance !== null && (
            <View style={styles.balanceIndicator}>
              <Text style={[
                styles.balanceText,
                { color: hasEnoughBalance ? '#10B981' : '#EF4444' }
              ]}>
                {hasEnoughBalance ? '✅ Sufficient Balance' : '❌ Insufficient Balance'}
              </Text>
            </View>
          )} */}
          
          {/* Wallet Address */}
          {/* {address && (
            <TouchableOpacity 
              style={styles.walletContainer}
              onPress={() => onCopyAddress(address)}
              activeOpacity={0.7}
            >
              <Text style={styles.walletLabel}>Your Wallet</Text>
              <Text style={styles.walletAddress}>
                {address.slice(0, 6)}...{address.slice(-4)}
              </Text>
            </TouchableOpacity>
          )} */}
        </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </MotiView>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  card: {
    borderRadius: responsive(20, 24, 28),
    overflow: 'hidden',
    ...shadows.large,
    ...(Platform.OS === 'web' && {
      transition: 'all 0.3s ease',
    }),
  },
  gradientBackground: {
    flex: 1,
    borderRadius: responsive(20, 24, 28),
    position: 'relative',
    overflow: 'hidden',
    minHeight: responsive(350, 400, 450),
  },
  decorativeElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  cylinder: {
    position: 'absolute',
    borderRadius: responsive(60, 80, 100),
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  cylinder1: {
    width: responsive(120, 150, 180),
    height: responsive(80, 100, 120),
    top: responsive(30, 40, 50),
    right: responsive(-40, -50, -60),
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    transform: [{ rotate: '25deg' }],
  },
  cylinder2: {
    width: responsive(100, 120, 140),
    height: responsive(60, 80, 100),
    bottom: responsive(40, 50, 60),
    left: responsive(-30, -40, -50),
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    transform: [{ rotate: '-30deg' }],
  },
  contentOverlay: {
    flex: 1,
    zIndex: 2,
    padding: responsive(16, 20, 24),
  },
  topIconContainer: {
    position: 'absolute',
    top: responsive(16, 20, 24),
    left: responsive(16, 20, 24),
    zIndex: 3,
  },
  iconCircle: {
    width: responsive(40, 48, 56),
    height: responsive(40, 48, 56),
    borderRadius: responsive(20, 24, 28),
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  iconText: {
    fontSize: responsive(18, 22, 26),
  },
  cardHovered: {
    transform: [{ scale: 1.02 }],
    shadowColor: '#5252D7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 2,
    borderColor: 'rgba(82, 82, 215, 0.4)',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 8px 32px rgba(82, 82, 215, 0.3), 0 0 0 2px rgba(82, 82, 215, 0.4)',
    }),
  },
  
  // Image Section
  imageSection: {
    position: 'relative',
    height: responsive(140, 160, 180),
    marginTop: responsive(60, 70, 80), // Space for top icon
    marginHorizontal: responsive(16, 20, 24),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: responsive(12, 16, 20),
    overflow: 'hidden',
    justifyContent: 'flex-start', // Align content to top
    alignItems: 'center',
  },
  productImage: {
    width: '100%',
    height: responsive(200, 220, 240), // Taller than container to allow cropping from bottom
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    position: 'absolute',
    top: 0, // Anchor to top of container
    left: 0,
    right: 0,
    ...(Platform.OS === 'web' && {
      // @ts-ignore - Web-specific CSS properties
      objectPosition: 'center top',
      objectFit: 'cover',
    }),
  },
  statusBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    paddingHorizontal: spacing.sm,
    zIndex: 2, // Ensure it appears above the image
    paddingVertical: spacing.xs,
    borderRadius: 20,
    ...shadows.small,
  },
  statusText: {
    fontSize: fontSizes.xs,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'NB International Pro Bold',
    letterSpacing: 0.5,
  },
  hotSaleBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: '#EF4444',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    zIndex: 2, // Ensure it appears above the image
    ...shadows.small,
  },
  hotSaleText: {
    fontSize: fontSizes.xs,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'NB International Pro Bold',
    letterSpacing: 0.5,
  },
  
  // Product Info Section
  productInfo: {
    padding: responsive(16, 20, 24),
    paddingTop: responsive(12, 16, 20),
    gap: spacing.sm,
    flex: 1,
  },
  category: {
    fontSize: fontSizes.xs,
    color: '#9CA3AF',
    fontFamily: 'NB International Pro',
    fontWeight: '500',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  productName: {
    fontSize: responsive(fontSizes.lg, fontSizes.xl, fontSizes.xxl),
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'NB International Pro Bold',
    lineHeight: responsive(fontSizes.lg * 1.3, fontSizes.xl * 1.3, fontSizes.xxl * 1.3),
  },
  description: {
    fontSize: responsive(fontSizes.sm, fontSizes.md, fontSizes.lg),
    color: '#D1D5DB',
    fontFamily: 'NB International Pro',
    lineHeight: responsive(fontSizes.sm * 1.4, fontSizes.md * 1.4, fontSizes.lg * 1.4),
  },
  
  // Features
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginVertical: spacing.sm,
  },
  featureTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  featureText: {
    fontSize: fontSizes.xs,
    color: '#A5B4FC',
    fontFamily: 'NB International Pro',
    fontWeight: '500',
  },
  
  // Pricing Section
  mainPriceSection: {
    alignItems: 'center',
    marginVertical: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: 'rgba(82, 82, 215, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(82, 82, 215, 0.3)',
  },
  mainPrice: {
    fontSize: responsive(fontSizes.xl, fontSizes.xxl, fontSizes.xxxl),
    fontWeight: 'bold',
    color: '#60A5FA',
    fontFamily: 'NB International Pro Bold',
    marginBottom: spacing.xs,
  },
  priceDescription: {
    fontSize: fontSizes.sm,
    color: '#9CA3AF',
    fontFamily: 'NB International Pro',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  fiatPrice: {
    fontSize: fontSizes.md,
    color: '#10B981',
    fontFamily: 'NB International Pro',
    fontWeight: '500',
  },
  balanceIndicator: {
    marginTop: spacing.xs,
    alignItems: 'center',
  },
  balanceText: {
    fontSize: fontSizes.xs,
    fontFamily: 'NB International Pro',
    fontWeight: '500',
  },
  disabledContainer: {
    opacity: 0.6,
  },
  earningsSection: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: 'rgba(31, 41, 55, 0.3)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(82, 82, 215, 0.2)',
  },
  earningsTitle: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'NB International Pro',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  earningsBreakdown: {
    marginBottom: spacing.md,
  },
  earningsBar: {
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  earningsSegment: {
    height: '100%',
  },
  platformFee: {
    backgroundColor: '#EF4444',
  },
  ownerShare: {
    backgroundColor: '#10B981',
  },
  operatorShare: {
    backgroundColor: '#60A5FA',
  },
  earningsLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    minWidth: '30%',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.xs,
  },
  legendText: {
    fontSize: fontSizes.xs,
    color: '#9CA3AF',
    fontFamily: 'NB International Pro',
  },
  addressContainer: {
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
  },
  addressLabel: {
    fontSize: fontSizes.xs,
    fontFamily: 'NB International Pro',
    fontWeight: '500',
  },
  
  
  // Wallet Section
  walletContainer: {
    backgroundColor: 'rgba(31, 41, 55, 0.6)',
    padding: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(82, 82, 215, 0.3)',
    marginTop: spacing.sm,
  },
  walletLabel: {
    fontSize: fontSizes.xs,
    color: '#9CA3AF',
    fontFamily: 'NB International Pro',
    marginBottom: 2,
  },
  walletAddress: {
    fontSize: fontSizes.sm,
    color: '#A5B4FC',
    fontFamily: 'NB International Pro',
    fontWeight: '600',
  },
})
