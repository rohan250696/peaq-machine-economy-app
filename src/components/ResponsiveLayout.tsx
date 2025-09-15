import React from 'react'
import { View, StyleSheet, Dimensions, Platform } from 'react-native'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

// Modern responsive breakpoints
export const breakpoints = {
  mobile: 375,
  mobileLarge: 414,
  tablet: 768,
  desktop: 1024,
  desktopLarge: 1440,
}

// Device detection
export const isMobile = SCREEN_WIDTH < breakpoints.tablet
export const isTablet = SCREEN_WIDTH >= breakpoints.tablet && SCREEN_WIDTH < breakpoints.desktop
export const isDesktop = SCREEN_WIDTH >= breakpoints.desktop
export const isLandscape = SCREEN_WIDTH > SCREEN_HEIGHT

// Responsive spacing system
export const spacing = {
  xs: isMobile ? 4 : 6,
  sm: isMobile ? 8 : 12,
  md: isMobile ? 16 : 20,
  lg: isMobile ? 24 : 32,
  xl: isMobile ? 32 : 40,
  xxl: isMobile ? 40 : 48,
  xxxl: isMobile ? 48 : 64,
}

// Responsive font sizes
export const fontSizes = {
  xs: isMobile ? 10 : 12,
  sm: isMobile ? 12 : 14,
  md: isMobile ? 14 : 16,
  lg: isMobile ? 16 : 18,
  xl: isMobile ? 18 : 20,
  xxl: isMobile ? 20 : 24,
  xxxl: isMobile ? 24 : 28,
  title: isMobile ? 28 : 32,
  largeTitle: isMobile ? 32 : 36,
  huge: isMobile ? 36 : 42,
}

// Container widths for different screen sizes
export const containerWidths = {
  mobile: '100%',
  tablet: '90%',
  desktop: '80%',
  desktopLarge: '70%',
}

// Grid columns for different screen sizes
export const gridColumns = {
  mobile: 1,
  tablet: 2,
  desktop: 3,
  desktopLarge: 4,
}

// Helper function for responsive values
export const responsive = (mobile: any, tablet?: any, desktop?: any) => {
  if (isDesktop && desktop !== undefined) return desktop
  if (isTablet && tablet !== undefined) return tablet
  return mobile
}

// Helper function to get container width
export const getContainerWidth = () => {
  if (isDesktop) return containerWidths.desktop
  if (isTablet) return containerWidths.tablet
  return containerWidths.mobile
}

// Helper function to get grid columns
export const getGridColumns = () => {
  if (isDesktop) return gridColumns.desktop
  if (isTablet) return gridColumns.tablet
  return gridColumns.mobile
}

// Helper function to get card width
export const getCardWidth = (columns?: number) => {
  const cols = columns || getGridColumns()
  const containerWidth = isDesktop ? SCREEN_WIDTH * 0.8 : SCREEN_WIDTH
  const padding = responsive(spacing.lg, spacing.xl, spacing.xxl) * 2
  const gap = responsive(spacing.md, spacing.lg, spacing.xl) * (cols - 1)
  return (containerWidth - padding - gap) / cols
}

interface ResponsiveLayoutProps {
  children: React.ReactNode
  style?: any
  maxWidth?: number
  center?: boolean
}

export default function ResponsiveLayout({ 
  children, 
  style, 
  maxWidth,
  center = true 
}: ResponsiveLayoutProps) {
  const containerStyle = [
    styles.container,
    center && styles.centered,
    maxWidth && { maxWidth },
    style
  ]

  return (
    <View style={containerStyle}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  centered: {
    alignSelf: 'center',
    width: getContainerWidth() as any,
  },
})

// Safe area padding for different devices
export const safeAreaPadding = {
  top: Platform.OS === 'web' ? 20 : (isMobile ? 50 : 60),
  bottom: Platform.OS === 'web' ? 20 : 40,
  horizontal: responsive(spacing.md, spacing.lg, spacing.xl),
}

// Modern glassmorphism styles
export const glassmorphism = {
  light: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
  },
  medium: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    backdropFilter: 'blur(15px)',
  },
  dark: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
  },
}

// Modern shadow styles
export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
}
