import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView, Image, Alert } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { MotiView } from 'moti'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { RootStackParamList, Machine } from '../types'
import { MOCK_MACHINES, GLASSMORPHISM, GRADIENTS } from '../constants'
import { scaleWidth, scaleHeight, spacing, fontSizes, safeAreaPadding, getCardWidth, isSmallScreen, layout, responsive } from '../utils/responsive'
import * as Clipboard from 'expo-clipboard'

const { width } = Dimensions.get('window')
const cardWidth = getCardWidth(2, safeAreaPadding.horizontal * 2)

type MachineSelectionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MachineSelection'>

export default function MachineSelectionScreen() {
  const navigation = useNavigation<MachineSelectionScreenNavigationProp>()
  const [machines, setMachines] = useState<Machine[]>(MOCK_MACHINES)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    // Simulate live revenue updates
    const interval = setInterval(() => {
      setMachines(prev => prev.map(machine => ({
        ...machine,
        revenue: machine.revenue + (Math.random() * 0.1 - 0.05)
      })))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    setRefreshing(false)
  }

  const handleMachinePress = (machine: Machine) => {
    navigation.navigate('Action', { machine })
  }

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const copyAddress = async (address: string) => {
    try {
      await Clipboard.setStringAsync(address)
      Alert.alert('Copied!', 'Address copied to clipboard')
    } catch (error) {
      Alert.alert('Error', 'Failed to copy address')
    }
  }

  const MachineCard = ({ machine, index }: { machine: Machine; index: number }) => (
    <MotiView
      from={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        type: 'timing',
        duration: 200,
        delay: index * 100,
      }}
    >
      <TouchableOpacity
        style={styles.machineCard}
        onPress={() => handleMachinePress(machine)}
        activeOpacity={0.8}
      >
        <View style={styles.cardGradient}>
          <View style={styles.cardContent}>
            {/* Machine Image */}
            <View style={styles.imageContainer}>
              <Image source={{ uri: machine.image }} style={styles.machineImage} />
              <View style={styles.statusIndicator}>
                <View style={[
                  styles.statusDot,
                  { backgroundColor: machine.isActive ? '#06B6D4' : '#EF4444' }
                ]} />
                <Text style={[
                  styles.statusText,
                  { color: machine.isActive ? '#06B6D4' : '#EF4444' }
                ]}>
                  {machine.isActive ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>

            {/* Machine Info */}
            <View style={styles.machineInfo}>
              <Text style={styles.machineName}>{machine.name}</Text>
              <Text style={styles.machineType}>{machine.type}</Text>
              
              {/* Revenue */}
              <View style={styles.revenueContainer}>
                <Text style={styles.revenueLabel}>Live Revenue</Text>
                <Text style={styles.revenueAmount}>
                  {machine.revenue.toFixed(2)} PEAQ
                </Text>
              </View>

              {/* Location */}
              <Text style={styles.machineLocation}>
                📍 {machine.location.name}
              </Text>

              {/* Address with Copy */}
              <TouchableOpacity 
                style={styles.addressContainer}
                onPress={() => copyAddress(machine.address)}
                activeOpacity={0.7}
              >
                <Text style={styles.machineAddress}>
                  {truncateAddress(machine.address)}
                </Text>
                <Text style={styles.copyIcon}>📋</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </MotiView>
  )

  return (
    <LinearGradient
      colors={['#0E0D0C', '#1A1A1A', '#0E0D0C']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
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
        <Text style={styles.title}>Available Machines</Text>
        <Text style={styles.subtitle}>
          Select a machine to interact with and earn
        </Text>
      </MotiView>

      {/* Machine Grid */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
        alwaysBounceVertical={false}
        scrollEventThrottle={16}
        // Web-specific props
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
            <Text style={styles.refreshText}>
              {refreshing ? 'Refreshing...' : '🔄 Pull to refresh'}
            </Text>
          </TouchableOpacity>
        }
      >
        <View style={styles.machineGrid}>
          {machines.map((machine, index) => (
            <MachineCard key={machine.id} machine={machine} index={index} />
          ))}
        </View>

        {/* Stats Section */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'timing',
            duration: 800,
            delay: 500,
          }}
          style={styles.statsContainer}
        >
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Total Network Revenue</Text>
            <Text style={styles.statsAmount}>
              {machines.reduce((sum, machine) => sum + machine.totalRevenue, 0).toFixed(2)} PEAQ
            </Text>
          </View>
          
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Active Machines</Text>
            <Text style={styles.statsAmount}>
              {machines.filter(m => m.isActive).length} / {machines.length}
            </Text>
          </View>
        </MotiView>
      </ScrollView>
      
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: safeAreaPadding.top,
    paddingHorizontal: safeAreaPadding.horizontal,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: responsive(fontSizes.title, fontSizes.largeTitle),
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: spacing.sm,
    fontFamily: 'NB International Pro Bold',
    lineHeight: responsive(fontSizes.title * 1.2, fontSizes.largeTitle * 1.2),
  },
  subtitle: {
    fontSize: responsive(fontSizes.lg, fontSizes.xl),
    color: '#A7A6A5',
    textAlign: 'center',
    fontFamily: 'NB International Pro',
    lineHeight: responsive(fontSizes.lg * 1.4, fontSizes.xl * 1.4),
    paddingHorizontal: spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: safeAreaPadding.horizontal,
    paddingBottom: safeAreaPadding.bottom,
  },
  refreshButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  refreshText: {
    color: '#5252D7',
    fontSize: fontSizes.md,
    fontFamily: 'NB International Pro',
  },
  machineGrid: {
    flexDirection: 'column',
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  machineCard: {
    width: '100%',
    marginBottom: spacing.md,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(82, 82, 215, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(82, 82, 215, 0.15)',
    shadowColor: '#5252D7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardGradient: {
    padding: spacing.lg,
    backgroundColor: 'rgba(82, 82, 215, 0.05)',
    borderRadius: 15,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    marginRight: spacing.md,
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  machineImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  statusIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  statusText: {
    fontSize: 10,
    fontFamily: 'NB International Pro',
    fontWeight: '600',
  },
  machineInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  machineName: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
    fontFamily: 'NB International Pro Bold',
  },
  machineType: {
    fontSize: fontSizes.sm,
    color: '#5252D7',
    marginBottom: spacing.sm,
    fontFamily: 'NB International Pro',
    fontWeight: '500',
  },
  revenueContainer: {
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  revenueLabel: {
    fontSize: 10,
    color: '#A7A6A5',
    marginBottom: 2,
    fontFamily: 'NB International Pro',
  },
  revenueAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#06B6D4',
    fontFamily: 'NB International Pro Bold',
  },
  machineLocation: {
    fontSize: 11,
    color: '#5252D7',
    fontFamily: 'NB International Pro',
    marginBottom: spacing.xs,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(82, 82, 215, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(82, 82, 215, 0.2)',
    alignSelf: 'flex-start',
  },
  machineAddress: {
    fontSize: 10,
    color: '#747372',
    fontFamily: 'NB International Pro',
    marginRight: spacing.xs,
  },
  copyIcon: {
    fontSize: 10,
    color: '#5252D7',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  statsCard: {
    flex: 1,
    backgroundColor: GLASSMORPHISM.card.background,
    borderRadius: layout.cardRadius,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: GLASSMORPHISM.card.border,
    alignItems: 'center',
    ...GLASSMORPHISM.card.shadow,
  },
  statsTitle: {
    fontSize: 12,
    color: '#A7A6A5',
    marginBottom: 8,
    fontFamily: 'NB International Pro',
  },
  statsAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'NB International Pro Bold',
  },
})
