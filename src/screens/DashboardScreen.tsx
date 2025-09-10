import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView, RefreshControl } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { MotiView } from 'moti'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { usePrivyAuth } from '../contexts/PrivyContext'
import { RootStackParamList, Ownership } from '../types'
import { MOCK_MACHINES, GLASSMORPHISM, GRADIENTS } from '../constants'
import { scaleWidth, scaleHeight, spacing, fontSizes, safeAreaPadding, isSmallScreen } from '../utils/responsive'
import UserBalance from '../components/UserBalance'

const { width } = Dimensions.get('window')

type DashboardScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Dashboard'>

// Mock user data
const MOCK_OWNERSHIPS: Ownership[] = [
  {
    machineId: 'robo-cafe-001',
    percentage: 0.1,
    tokens: 10,
    totalTokens: 1000,
    earnings: 0.32,
    lastEarning: new Date().toISOString(),
  },
  {
    machineId: 'humanoid-001',
    percentage: 0.05,
    tokens: 5,
    totalTokens: 1000,
    earnings: 0.18,
    lastEarning: new Date().toISOString(),
  },
]

// Mock earnings data for chart
const MOCK_EARNINGS_DATA = [
  { time: '00:00', earnings: 0.1 },
  { time: '04:00', earnings: 0.15 },
  { time: '08:00', earnings: 0.22 },
  { time: '12:00', earnings: 0.28 },
  { time: '16:00', earnings: 0.35 },
  { time: '20:00', earnings: 0.42 },
  { time: '24:00', earnings: 0.50 },
]

export default function DashboardScreen() {
  const navigation = useNavigation<DashboardScreenNavigationProp>()
  const { user, authenticated, logout } = usePrivy()
  const { wallets } = useWallets()
  const { currentChain, switchToPeaqChain } = usePrivyAuth()
  const [refreshing, setRefreshing] = useState(false)
  const [totalBalance, setTotalBalance] = useState(0.50)
  const [animatedBalance, setAnimatedBalance] = useState(0)
  const [ownerships, setOwnerships] = useState<Ownership[]>(MOCK_OWNERSHIPS)

  // Redirect to onboarding if not authenticated
  useEffect(() => {
    if (!authenticated) {
      navigation.replace('Onboarding')
    }
  }, [authenticated, navigation])

  useEffect(() => {
    // Animate balance counter
    const animateBalance = () => {
      let current = 0
      const target = totalBalance
      const increment = target / 50
      
      const timer = setInterval(() => {
        current += increment
        if (current >= target) {
          current = target
          clearInterval(timer)
        }
        setAnimatedBalance(current)
      }, 30)
    }
    
    animateBalance()
  }, [totalBalance])

  const handleRefresh = async () => {
    setRefreshing(true)
    
    // Simulate refresh delay and update earnings
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setOwnerships(prev => prev.map(ownership => ({
      ...ownership,
      earnings: ownership.earnings + (Math.random() * 0.1),
      lastEarning: new Date().toISOString()
    })))
    
    setTotalBalance(prev => prev + (Math.random() * 0.2))
    setRefreshing(false)
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigation.replace('Onboarding')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const getMachineById = (machineId: string) => {
    return MOCK_MACHINES.find(machine => machine.id === machineId)
  }

  const getTotalEarnings = () => {
    return ownerships.reduce((sum, ownership) => sum + ownership.earnings, 0)
  }

  const getTotalOwnership = () => {
    return ownerships.reduce((sum, ownership) => sum + ownership.percentage, 0)
  }

  return (
    <LinearGradient
      colors={['#0E0D0C', '#1A1A1A', '#0E0D0C']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#5252D7"
            colors={['#5252D7']}
          />
        }
        showsVerticalScrollIndicator={false}
        bounces={true}
        alwaysBounceVertical={false}
        scrollEventThrottle={16}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <MotiView
          from={{ opacity: 0, translateY: -30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'timing',
            duration: 800,
          }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.title}>Dashboard</Text>
              <Text style={styles.subtitle}>Your Machine Economy Portfolio</Text>
              {user && (
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>
                    Welcome, {user.email?.address || 'User'}!
                  </Text>
                  {wallets[0] && (
                    <Text style={styles.walletAddress}>
                      {wallets[0].address.slice(0, 6)}...{wallets[0].address.slice(-4)}
                    </Text>
                  )}
                </View>
              )}
            </View>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </MotiView>

        {/* User Balance */}
        <UserBalance 
          balance={totalBalance} 
          onRefresh={handleRefresh}
          showRefresh={true}
        />

        {/* Stats Grid */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'timing',
            duration: 800,
            delay: 400,
          }}
          style={styles.statsGrid}
        >
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🏭</Text>
            <Text style={styles.statValue}>{ownerships.length}</Text>
            <Text style={styles.statLabel}>Machines Owned</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>📊</Text>
            <Text style={styles.statValue}>{getTotalOwnership().toFixed(1)}%</Text>
            <Text style={styles.statLabel}>Total Ownership</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>💰</Text>
            <Text style={styles.statValue}>{getTotalEarnings().toFixed(2)}</Text>
            <Text style={styles.statLabel}>Total Earnings</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>📈</Text>
            <Text style={styles.statValue}>+12.5%</Text>
            <Text style={styles.statLabel}>24h Growth</Text>
          </View>
        </MotiView>

        {/* Peaq Chain Information */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'timing',
            duration: 800,
            delay: 700,
          }}
          style={styles.chainSection}
        >
          <Text style={styles.sectionTitle}>Peaq Network</Text>
          
          <View style={styles.chainCard}>
            <View style={styles.chainInfo}>
              <View style={styles.chainRow}>
                <Text style={styles.chainLabel}>Network</Text>
                <Text style={styles.chainValue}>{currentChain.name}</Text>
              </View>
              
              <View style={styles.chainRow}>
                <Text style={styles.chainLabel}>Chain ID</Text>
                <Text style={styles.chainValue}>{currentChain.id}</Text>
              </View>
              
              <View style={styles.chainRow}>
                <Text style={styles.chainLabel}>Currency</Text>
                <Text style={styles.chainValue}>{currentChain.nativeCurrency.symbol}</Text>
              </View>
              
              <View style={styles.chainRow}>
                <Text style={styles.chainLabel}>Explorer</Text>
                <Text style={styles.chainValue}>Subscan</Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.switchChainButton}
              onPress={switchToPeaqChain}
            >
              <Text style={styles.switchChainButtonText}>Switch to Peaq</Text>
            </TouchableOpacity>
          </View>
        </MotiView>

        {/* Machine Ownership List */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'timing',
            duration: 800,
            delay: 800,
          }}
          style={styles.ownershipSection}
        >
          <Text style={styles.sectionTitle}>Your Machines</Text>
          
          {ownerships.map((ownership, index) => {
            const machine = getMachineById(ownership.machineId)
            if (!machine) return null
            
            return (
              <MotiView
                key={ownership.machineId}
                from={{ opacity: 0, translateX: -20 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{
                  type: 'timing',
                  duration: 500,
                  delay: 1000 + index * 100,
                }}
                style={styles.ownershipCard}
              >
                <View style={styles.ownershipCardContent}>
                  <View style={styles.machineInfo}>
                    <Text style={styles.machineName}>{machine.name}</Text>
                    <Text style={styles.machineType}>{machine.type}</Text>
                  </View>
                  
                  <View style={styles.ownershipInfo}>
                    <View style={styles.ownershipRow}>
                      <Text style={styles.ownershipLabel}>Ownership</Text>
                      <Text style={styles.ownershipValue}>
                        {ownership.percentage.toFixed(1)}%
                      </Text>
                    </View>
                    
                    <View style={styles.ownershipRow}>
                      <Text style={styles.ownershipLabel}>Earnings</Text>
                      <Text style={styles.ownershipValue}>
                        {ownership.earnings.toFixed(3)} PEAQ
                      </Text>
                    </View>
                    
                    <View style={styles.ownershipRow}>
                      <Text style={styles.ownershipLabel}>Tokens</Text>
                      <Text style={styles.ownershipValue}>
                        {ownership.tokens} / {ownership.totalTokens}
                      </Text>
                    </View>
                  </View>
                </View>
              </MotiView>
            )
          })}
        </MotiView>

        {/* Action Buttons */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'timing',
            duration: 800,
            delay: 1000,
          }}
          style={styles.actionButtons}
        >
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('MachineSelection')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={GRADIENTS.primary as [string, string]}
              style={styles.actionButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.actionButtonText}>Explore More Machines</Text>
            </LinearGradient>
          </TouchableOpacity>
        </MotiView>
      </ScrollView>
      
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: safeAreaPadding.horizontal,
    paddingTop: safeAreaPadding.top,
    paddingBottom: safeAreaPadding.bottom + spacing.xl,
  },
  header: {
    marginBottom: 32,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  userInfo: {
    marginTop: 8,
  },
  userName: {
    fontSize: 14,
    color: '#5252D7',
    fontFamily: 'NB International Pro',
    marginBottom: 4,
  },
  walletAddress: {
    fontSize: 12,
    color: '#A7A6A5',
    fontFamily: 'NB International Pro',
  },
  logoutButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  logoutText: {
    fontSize: 12,
    color: '#EF4444',
    fontFamily: 'NB International Pro',
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  notificationButton: {
    backgroundColor: GLASSMORPHISM.background,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: GLASSMORPHISM.border,
    ...GLASSMORPHISM.shadow,
  },
  notificationIcon: {
    fontSize: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    fontFamily: 'NB International Pro Bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#A7A6A5',
    fontFamily: 'NB International Pro',
  },
  balanceCard: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    ...GLASSMORPHISM.shadow,
  },
  balanceGradient: {
    padding: 24,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
    fontFamily: 'NB International Pro',
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    fontFamily: 'NB International Pro Bold',
  },
  balanceSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: 'NB International Pro',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    width: (width - 60) / 2,
    backgroundColor: GLASSMORPHISM.background,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: GLASSMORPHISM.border,
    ...GLASSMORPHISM.shadow,
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    fontFamily: 'NB International Pro Bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#A7A6A5',
    textAlign: 'center',
    fontFamily: 'NB International Pro',
  },
  chartContainer: {
    marginBottom: 24,
  },
  chartCard: {
    backgroundColor: GLASSMORPHISM.background,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: GLASSMORPHISM.border,
    ...GLASSMORPHISM.shadow,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    fontFamily: 'NB International Pro Bold',
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 20,
    borderRadius: 10,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 10,
    color: '#A7A6A5',
    fontFamily: 'NB International Pro',
  },
  chainSection: {
    marginBottom: 24,
  },
  chainCard: {
    backgroundColor: GLASSMORPHISM.background,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: GLASSMORPHISM.border,
    ...GLASSMORPHISM.shadow,
  },
  chainInfo: {
    marginBottom: 16,
  },
  chainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  chainLabel: {
    fontSize: 14,
    color: '#A7A6A5',
    fontFamily: 'NB International Pro',
  },
  chainValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontFamily: 'NB International Pro Bold',
  },
  switchChainButton: {
    backgroundColor: '#5252D7',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  switchChainButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'NB International Pro Bold',
  },
  ownershipSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    fontFamily: 'NB International Pro Bold',
  },
  ownershipCard: {
    backgroundColor: GLASSMORPHISM.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: GLASSMORPHISM.border,
    ...GLASSMORPHISM.shadow,
  },
  ownershipCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  machineInfo: {
    flex: 1,
  },
  machineName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    fontFamily: 'NB International Pro Bold',
  },
  machineType: {
    fontSize: 14,
    color: '#5252D7',
    fontFamily: 'NB International Pro',
  },
  ownershipInfo: {
    alignItems: 'flex-end',
  },
  ownershipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ownershipLabel: {
    fontSize: 12,
    color: '#A7A6A5',
    marginRight: 8,
    fontFamily: 'NB International Pro',
  },
  ownershipValue: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    fontFamily: 'NB International Pro',
  },
  actionButtons: {
    gap: 16,
  },
  actionButton: {
    borderRadius: 16,
    overflow: 'hidden',
    ...GLASSMORPHISM.shadow,
  },
  actionButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'NB International Pro Bold',
  },
})
