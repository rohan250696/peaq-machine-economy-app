import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Platform } from 'react-native'
import { MotiView } from 'moti'
import { Machine } from '../types'
import { useAccount } from 'wagmi'
import { useMachineManager } from '../contexts/MachineManagerContext'
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

  const isDisabled = machine.price && hasEnoughBalance === false

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: isDisabled ? 0.6 : 1, scale: 1 }}
      transition={{
        type: 'spring',
        damping: 15,
        stiffness: 150,
        delay: index * 100,
      }}
      style={[
        styles.container,
        { width: isGridLayout ? cardWidth : '100%' },
        isDisabled ? styles.disabledContainer : null,
      ]}
    >
      <TouchableOpacity
        style={[
          styles.card,
          isHovered && styles.cardHovered
        ]}
        onPress={() => !isDisabled && onPress(machine)}
        activeOpacity={isDisabled ? 1 : 0.8}
        disabled={!!isDisabled}
        {...(Platform.OS === 'web' && {
          onMouseEnter: () => !isDisabled && setIsHovered(true),
          onMouseLeave: () => !isDisabled && setIsHovered(false),
        })}
      >
        {/* Product Image Section */}
        <View style={styles.imageSection}>
          <Image 
            source={{ uri: machine.image }} 
            style={styles.productImage}
            resizeMode="cover"
          />
          
          {/* Status Badge */}
          <View style={[
            styles.statusBadge,
            { backgroundColor: machine.isActive ? '#10B981' : '#EF4444' }
          ]}>
            <Text style={styles.statusText}>
              {machine.isActive ? 'ACTIVE' : 'INACTIVE'}
            </Text>
          </View>
          
          {/* Hot Sale Badge for Active Machines */}
          {machine.isActive && machine.revenue > 10 && (
            <View style={styles.hotSaleBadge}>
              <Text style={styles.hotSaleText}>HOT SALE</Text>
            </View>
          )}
        </View>

        {/* Product Info Section */}
        <View style={styles.productInfo}>
          {/* Category */}
          <Text style={styles.category}>PEAQ MACHINE</Text>
          
          {/* Product Name */}
          <Text style={styles.productName} numberOfLines={2}>
            {machine.type === 'RoboCafe' ? '☕ ' : '🤖 '}{machine.name}
          </Text>
          
          {/* Description */}
          <Text style={styles.description} numberOfLines={2}>
            {machine.type} • {machine.location.name}
          </Text>
          
          {/* Features Tags */}
          <View style={styles.featuresContainer}>
            <View style={styles.featureTag}>
              <Text style={styles.featureText}>Live Revenue</Text>
            </View>
            <View style={styles.featureTag}>
              <Text style={styles.featureText}>Peaq Network</Text>
            </View>
            <View style={styles.featureTag}>
              <Text style={styles.featureText}>Decentralized</Text>
            </View>
          </View>
          
          {/* Main Price Display */}
          <View style={styles.mainPriceSection}>
            <Text style={styles.mainPrice}>
              {isLoading ? 'Loading...' : machine.price ? `${machine.price} PEAQ` : `${machine.revenue.toFixed(2)} PEAQ`}
            </Text>
            <Text style={styles.priceDescription}>
              {machine.type === 'RoboCafe' ? 'Cost to order one coffee' : 'Cost per interaction or rental slot'}
            </Text>
            {machine.price && (
              <Text style={styles.fiatPrice}>
                ~${(parseFloat(machine.price.toString()) * 1.0).toFixed(2)} USD
              </Text>
            )}
          </View>
          
          {/* Earnings Breakdown */}
          {machine.price && (
            <View style={styles.earningsSection}>
              <Text style={styles.earningsTitle}>How Earnings Are Distributed</Text>
              
              {/* Visual Earnings Breakdown */}
              <View style={styles.earningsBreakdown}>
                <View style={styles.earningsBar}>
                  <View style={[styles.earningsSegment, styles.platformFee, { width: `${(machine.platformFeeBps || 0) / 10}%` }]} />
                  <View style={[styles.earningsSegment, styles.ownerShare, { width: `${(machine.revenueShareBps || 0) / 10}%` }]} />
                  <View style={[styles.earningsSegment, styles.operatorShare, { width: `${100 - ((machine.platformFeeBps || 0) + (machine.revenueShareBps || 0)) / 10}%` }]} />
                </View>
                
                <View style={styles.earningsLegend}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendColor, styles.platformFee]} />
                    <Text style={styles.legendText}>Platform Fee: {((machine.platformFeeBps || 0) / 100).toFixed(1)}%</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendColor, styles.ownerShare]} />
                    <Text style={styles.legendText}>Owners: {((machine.revenueShareBps || 0) / 100).toFixed(1)}%</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendColor, styles.operatorShare]} />
                    <Text style={styles.legendText}>Operator: {(100 - ((machine.platformFeeBps || 0) + (machine.revenueShareBps || 0)) / 100).toFixed(1)}%</Text>
                  </View>
                </View>
              </View>
              
              {/* Shares Explanation */}
              <View style={styles.sharesSection}>
                <Text style={styles.sharesTitle}>Ownership Shares</Text>
                <Text style={styles.sharesDescription}>
                  Every time you use this machine, you also become a co-owner! You get {machine.sharesPerPurchase || 0} fractional shares.
                </Text>
                <Text style={styles.sharesSubtext}>
                  These shares entitle you to {(machine.revenueShareBps || 0) / 100}% of future earnings from this machine.
                </Text>
              </View>
            </View>
          )}
          
          {/* Machine Address Section */}
          <View style={styles.machineAddressSection}>
            <Text style={styles.machineAddressLabel}>Machine Identity</Text>
            <View style={styles.machineAddressContainer}>
              <Text style={styles.machineAddressStatus}>
                {machine.address ? '✅ Connected' : '⏳ Not yet assigned'}
              </Text>
              {machine.address && (
                <TouchableOpacity 
                  style={styles.machineAddressButton}
                  onPress={() => onCopyAddress(machine.address)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.machineAddressText}>
                    {machine.address.slice(0, 8)}...{machine.address.slice(-6)}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          {/* Balance Indicator */}
          {machine.price && hasEnoughBalance !== null && (
            <View style={styles.balanceIndicator}>
              <Text style={[
                styles.balanceText,
                { color: hasEnoughBalance ? '#10B981' : '#EF4444' }
              ]}>
                {hasEnoughBalance ? '✅ Sufficient Balance' : '❌ Insufficient Balance'}
              </Text>
            </View>
          )}
          
          {/* Wallet Address */}
          {address && (
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
          )}
        </View>
      </TouchableOpacity>
    </MotiView>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  card: {
    borderRadius: responsive(16, 20, 24),
    overflow: 'hidden',
    ...shadows.large,
    position: 'relative',
    ...glassmorphism.medium,
    ...(Platform.OS === 'web' && {
      transition: 'all 0.3s ease',
    }),
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
    height: responsive(200, 240, 280),
    backgroundColor: '#1F2937',
  },
  productImage: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
  },
  statusBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    paddingHorizontal: spacing.sm,
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
    padding: responsive(spacing.md, spacing.lg, spacing.xl),
    gap: spacing.sm,
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
    backgroundColor: 'rgba(82, 82, 215, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(82, 82, 215, 0.4)',
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
  sharesSection: {
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: 'rgba(82, 82, 215, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(82, 82, 215, 0.2)',
  },
  sharesTitle: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'NB International Pro',
    marginBottom: spacing.xs,
  },
  sharesDescription: {
    fontSize: fontSizes.sm,
    color: '#E5E7EB',
    fontFamily: 'NB International Pro',
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  sharesSubtext: {
    fontSize: fontSizes.xs,
    color: '#9CA3AF',
    fontFamily: 'NB International Pro',
    fontStyle: 'italic',
  },
  machineAddressSection: {
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: 'rgba(31, 41, 55, 0.3)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(82, 82, 215, 0.2)',
  },
  machineAddressLabel: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'NB International Pro',
    marginBottom: spacing.xs,
  },
  machineAddressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  machineAddressStatus: {
    fontSize: fontSizes.sm,
    color: '#10B981',
    fontFamily: 'NB International Pro',
    fontWeight: '500',
  },
  machineAddressButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(82, 82, 215, 0.2)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(82, 82, 215, 0.3)',
  },
  machineAddressText: {
    fontSize: fontSizes.xs,
    color: '#60A5FA',
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
