import React, { useEffect } from 'react'
import { View, Text, StyleSheet, Dimensions } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { MotiView } from 'moti'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { RootStackParamList } from '../types'
import PeaqLogo from '../components/PeaqLogo'
import { scaleWidth, scaleHeight, spacing, fontSizes, safeAreaPadding } from '../utils/responsive'

const { width, height } = Dimensions.get('window')

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Splash'>

export default function SplashScreen() {
  const navigation = useNavigation<SplashScreenNavigationProp>()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Onboarding')
    }, 3000)

    return () => clearTimeout(timer)
  }, [navigation])

  return (
    <LinearGradient
      colors={['#0E0D0C', '#1A1A1A', '#0E0D0C']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Background Pattern */}
      <MotiView
        from={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.1, scale: 1 }}
        transition={{
          type: 'timing',
          duration: 2000,
          loop: true,
        }}
        style={styles.backgroundPattern}
      >
        <View style={styles.patternCircle1} />
        <View style={styles.patternCircle2} />
        <View style={styles.patternCircle3} />
      </MotiView>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Logo Animation */}
        <View style={styles.logoContainer}>
          <PeaqLogo size="large" animated={true} />
        </View>

        {/* Title */}
        <MotiView
          from={{ opacity: 0, translateY: 50 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'timing',
            duration: 800,
            delay: 1000,
          }}
        >
          <Text style={styles.subtitle}>Machine Economy</Text>
        </MotiView>

        {/* Description */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'timing',
            duration: 800,
            delay: 1500,
          }}
        >
          <Text style={styles.description}>
            Own, operate, and earn from{'\n'}autonomous machines
          </Text>
        </MotiView>

        {/* Loading Indicator */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            type: 'timing',
            duration: 500,
            delay: 2000,
          }}
          style={styles.loadingContainer}
        >
          <MotiView
            from={{ scale: 0.8, opacity: 0.5 }}
            animate={{ scale: 1.2, opacity: 1 }}
            transition={{
              type: 'timing',
              duration: 1000,
              loop: true,
            }}
            style={styles.loadingDot}
          />
          <MotiView
            from={{ scale: 0.8, opacity: 0.5 }}
            animate={{ scale: 1.2, opacity: 1 }}
            transition={{
              type: 'timing',
              duration: 1000,
              loop: true,
              delay: 200,
            }}
            style={styles.loadingDot}
          />
          <MotiView
            from={{ scale: 0.8, opacity: 0.5 }}
            animate={{ scale: 1.2, opacity: 1 }}
            transition={{
              type: 'timing',
              duration: 1000,
              loop: true,
              delay: 400,
            }}
            style={styles.loadingDot}
          />
        </MotiView>
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundPattern: {
    position: 'absolute',
    width: width * 2,
    height: height * 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  patternCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#8B5CF6',
    opacity: 0.1,
    top: height * 0.2,
    left: width * 0.1,
  },
  patternCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#06B6D4',
    opacity: 0.1,
    top: height * 0.6,
    right: width * 0.1,
  },
  patternCircle3: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F59E0B',
    opacity: 0.1,
    top: height * 0.4,
    left: width * 0.3,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: safeAreaPadding.horizontal,
  },
  logoContainer: {
    marginBottom: spacing.xxl,
  },
  subtitle: {
    fontSize: fontSizes.xxxl,
    color: '#5252D7',
    textAlign: 'center',
    marginBottom: spacing.xl,
    fontFamily: 'NB International Pro',
  },
  description: {
    fontSize: fontSizes.xl,
    color: '#A7A6A5',
    textAlign: 'center',
    lineHeight: fontSizes.xl * 1.3,
    marginBottom: spacing.xxl + spacing.lg,
    fontFamily: 'NB International Pro',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#5252D7',
    marginHorizontal: 4,
  },
})
