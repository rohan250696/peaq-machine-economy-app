import { Dimensions, PixelRatio } from 'react-native'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

// Base dimensions (iPhone 14 Pro as reference for better modern scaling)
const BASE_WIDTH = 393
const BASE_HEIGHT = 852

// Enhanced responsive scaling functions
export const scaleWidth = (size: number) => {
  const scale = SCREEN_WIDTH / BASE_WIDTH
  // More conservative scaling for better mobile experience
  const scaledSize = size * Math.max(0.85, Math.min(1.15, scale))
  return Math.round(PixelRatio.roundToNearestPixel(scaledSize))
}

export const scaleHeight = (size: number) => {
  const scale = SCREEN_HEIGHT / BASE_HEIGHT
  const scaledSize = size * Math.max(0.85, Math.min(1.15, scale))
  return Math.round(PixelRatio.roundToNearestPixel(scaledSize))
}

export const scaleFont = (size: number) => {
  const scale = SCREEN_WIDTH / BASE_WIDTH
  // More conservative font scaling for better readability
  const scaledSize = size * Math.max(0.9, Math.min(1.1, scale))
  return Math.round(PixelRatio.roundToNearestPixel(scaledSize))
}

// Enhanced screen size categories
export const isSmallScreen = SCREEN_WIDTH < 375
export const isMediumScreen = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414
export const isLargeScreen = SCREEN_WIDTH >= 414 && SCREEN_WIDTH < 768
export const isTablet = SCREEN_WIDTH >= 768
export const isLandscape = SCREEN_WIDTH > SCREEN_HEIGHT

// Enhanced responsive spacing system
export const spacing = {
  xs: scaleWidth(4),
  sm: scaleWidth(8),
  md: scaleWidth(16),
  lg: scaleWidth(24),
  xl: scaleWidth(32),
  xxl: scaleWidth(40),
  xxxl: scaleWidth(48),
}

// Enhanced responsive font sizes
export const fontSizes = {
  xs: scaleFont(10),
  sm: scaleFont(12),
  md: scaleFont(14),
  lg: scaleFont(16),
  xl: scaleFont(18),
  xxl: scaleFont(20),
  xxxl: scaleFont(24),
  title: scaleFont(28),
  largeTitle: scaleFont(32),
  huge: scaleFont(36),
}

// Enhanced card dimensions with better spacing
export const getCardWidth = (columns: number = 2, padding: number = 24) => {
  const availableWidth = SCREEN_WIDTH - (padding * 2)
  const gap = spacing.sm
  const totalGapWidth = gap * (columns - 1)
  const cardWidth = (availableWidth - totalGapWidth) / columns
  // Ensure minimum card width for better mobile experience
  return Math.max(cardWidth, scaleWidth(150))
}

// Enhanced safe area padding
export const safeAreaPadding = {
  top: isSmallScreen ? scaleHeight(50) : scaleHeight(60),
  bottom: scaleHeight(40),
  horizontal: isSmallScreen ? spacing.md : spacing.lg,
}

// Enhanced device-specific adjustments
export const deviceSpecific = {
  isTablet,
  isLandscape,
  hasNotch: SCREEN_HEIGHT > 800,
  isSmallDevice: SCREEN_WIDTH < 375,
  isLargeDevice: SCREEN_WIDTH > 414,
}

// Enhanced layout helpers
export const layout = {
  // Better button sizing
  buttonHeight: scaleHeight(48),
  buttonHeightSmall: scaleHeight(40),
  buttonHeightLarge: scaleHeight(56),
  
  // Better input sizing
  inputHeight: scaleHeight(48),
  
  // Better card sizing
  cardRadius: scaleWidth(16),
  cardRadiusLarge: scaleWidth(20),
  
  // Better icon sizing
  iconSize: scaleWidth(24),
  iconSizeSmall: scaleWidth(20),
  iconSizeLarge: scaleWidth(32),
  
  // Better image sizing
  imageAspectRatio: 1.2,
  machineImageHeight: scaleHeight(120),
}

// Enhanced responsive breakpoints
export const breakpoints = {
  mobile: 375,
  mobileLarge: 414,
  tablet: 768,
  desktop: 1024,
}

// Helper function for responsive values
export const responsive = (mobile: any, tablet?: any, desktop?: any) => {
  if (isTablet && tablet !== undefined) {
    return desktop !== undefined ? desktop : tablet
  }
  return mobile
}
