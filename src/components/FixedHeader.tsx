import React from 'react'
import { View, StyleSheet, Platform } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { MotiView } from 'moti'
import PeaqLogo from './PeaqLogo'
import UserInfoHeader from './UserInfoHeader'
import { spacing, responsive } from './ResponsiveLayout'
import { useTheme } from '../contexts/ThemeContext'

export default function FixedHeader() {
  const { colors } = useTheme()
  
  // Create dynamic styles based on theme
  const dynamicStyles = React.useMemo(() => StyleSheet.create({
    headerGradient: {
      ...styles.headerGradient,
      borderBottomColor: colors.border,
    },
  }), [colors])
  
  if (Platform.OS === 'web') {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        height: responsive(70, 80, 90),
      }}>
        <View style={styles.webContainer}>
          <LinearGradient
            colors={[colors.background, colors.surface]}
            style={dynamicStyles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <MotiView
              from={{ opacity: 0, translateY: -20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{
                type: 'spring',
                damping: 15,
                stiffness: 100,
              }}
              style={styles.headerContent}
            >
              {/* Left side - Peaq Logo */}
              <View style={styles.logoContainer}>
                <PeaqLogo size="small" animated={true} />
              </View>

              {/* Right side - User Info */}
              <View style={styles.userInfoContainer}>
                <UserInfoHeader />
              </View>
            </MotiView>
          </LinearGradient>
        </View>
      </div>
    )
  }

  // Mobile version
  return (
    <View style={styles.mobileContainer}>
      <LinearGradient
        colors={[colors.background, colors.surface]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'spring',
            damping: 15,
            stiffness: 100,
          }}
          style={styles.headerContent}
        >
          {/* Left side - Peaq Logo */}
          <View style={styles.logoContainer}>
            <PeaqLogo size="small" animated={true} />
          </View>

          {/* Right side - User Info */}
          <View style={styles.userInfoContainer}>
            <UserInfoHeader />
          </View>
        </MotiView>
      </LinearGradient>
    </View>
  )
}

const styles = StyleSheet.create({
  webContainer: {
    position: 'relative' as const,
    width: '100%',
    height: '100%',
  },
  mobileContainer: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    height: responsive(70, 80, 90),
  },
  headerGradient: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(82, 82, 215, 0.2)',
  } as any,
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: responsive(spacing.lg, spacing.xl, spacing.xxl),
    paddingVertical: responsive(spacing.sm, spacing.md, spacing.lg),
  },
  logoContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  userInfoContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
})
