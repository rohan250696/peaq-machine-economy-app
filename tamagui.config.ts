import { config } from '@tamagui/config/v3'
import { createTamagui } from '@tamagui/core'

// Custom theme for Peaq Machine Economy
const peaqTheme = {
  ...config.themes,
  light: {
    ...config.themes.light,
    // Peaq official colors - light theme
    background: '#FFFFFF', // custom-white
    backgroundHover: '#F7F6F6', // custom-gray
    backgroundPress: '#EBE9E8', // gray-100
    backgroundFocus: '#F7F6F6',
    backgroundStrong: '#0E0D0C', // custom-black
    backgroundTransparent: 'transparent',
    
    // Glassmorphism colors
    glassBackground: 'rgba(82, 82, 215, 0.05)',
    glassBorder: 'rgba(82, 82, 215, 0.1)',
    
    // Peaq gradient colors
    gradientStart: '#5252D7', // purple-600
    gradientEnd: '#8484FE',   // text-color-400
    
    // Machine economy specific colors
    machineCard: 'rgba(82, 82, 215, 0.05)',
    machineCardBorder: 'rgba(82, 82, 215, 0.2)',
    successGreen: '#06B6D4', // cyan-500
    warningOrange: '#CC940A', // alert-text
    errorRed: '#FF5F52', // red-scale-FF5F52
    
    // Text colors
    color: '#0E0D0C', // custom-black
    colorHover: '#5B5A59', // text-dark
    colorPress: '#747372', // network-text-secondary
    colorFocus: '#5B5A59',
    colorTransparent: 'transparent',
    
    // Border colors
    borderColor: 'rgba(82, 82, 215, 0.1)',
    borderColorHover: 'rgba(82, 82, 215, 0.2)',
    borderColorPress: 'rgba(82, 82, 215, 0.3)',
    borderColorFocus: 'rgba(82, 82, 215, 0.3)',
    
    // Peaq specific colors
    primary: '#5252D7', // purple-600
    primaryForeground: '#FFFFFF',
    secondary: '#F0F0FF', // purple-50
    secondaryForeground: '#301D74', // text-primary
    accent: '#E9E9FF', // custom-purple
    accentForeground: '#301D74',
    muted: '#F7F6F6', // custom-gray
    mutedForeground: '#5B5A59', // text-dark
    card: '#FFFFFF',
    cardForeground: '#0E0D0C',
    popover: '#FFFFFF',
    popoverForeground: '#0E0D0C',
    destructive: '#FF5F52',
    destructiveForeground: '#FFFFFF',
    input: '#F7F6F6',
    ring: '#5252D7',
  },
  dark: {
    ...config.themes.dark,
    // Peaq official colors - dark theme
    background: '#0E0D0C', // custom-black
    backgroundHover: '#1A1A1A',
    backgroundPress: '#2A2A2A',
    backgroundFocus: '#1A1A1A',
    backgroundStrong: '#FFFFFF',
    backgroundTransparent: 'transparent',
    
    // Glassmorphism colors
    glassBackground: 'rgba(255, 255, 255, 0.05)',
    glassBorder: 'rgba(255, 255, 255, 0.1)',
    
    // Peaq gradient colors
    gradientStart: '#5252D7', // purple-600
    gradientEnd: '#8484FE',   // text-color-400
    
    // Machine economy specific colors
    machineCard: 'rgba(82, 82, 215, 0.1)',
    machineCardBorder: 'rgba(82, 82, 215, 0.3)',
    successGreen: '#06B6D4', // cyan-500
    warningOrange: '#CC940A', // alert-text
    errorRed: '#FF5F52', // red-scale-FF5F52
    
    // Text colors
    color: '#FFFFFF',
    colorHover: '#A7A6A5', // text-secondary
    colorPress: '#747372', // network-text-secondary
    colorFocus: '#A7A6A5',
    colorTransparent: 'transparent',
    
    // Border colors
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderColorHover: 'rgba(82, 82, 215, 0.3)',
    borderColorPress: 'rgba(82, 82, 215, 0.5)',
    borderColorFocus: 'rgba(82, 82, 215, 0.5)',
    
    // Peaq specific colors
    primary: '#5252D7', // purple-600
    primaryForeground: '#FFFFFF',
    secondary: '#F0F0FF', // purple-50
    secondaryForeground: '#301D74', // text-primary
    accent: '#E9E9FF', // custom-purple
    accentForeground: '#301D74',
    muted: '#EBE9E8', // gray-100
    mutedForeground: '#A7A6A5',
    card: '#F7F6F5', // card-primary-background
    cardForeground: '#301D74',
    popover: '#F7F6F5',
    popoverForeground: '#301D74',
    destructive: '#FF5F52',
    destructiveForeground: '#FFFFFF',
    input: '#F7F6F6',
    ring: '#5252D7',
  },
}

const tamaguiConfig = createTamagui({
  ...config,
  themes: peaqTheme,
  fonts: {
    ...config.fonts,
    body: {
      family: 'NB International Pro, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      size: {
        1: 12,
        2: 14,
        3: 16,
        4: 18,
        5: 20,
        6: 24,
        7: 28,
        8: 32,
        9: 36,
        10: 40,
        11: 48,
        12: 56,
        13: 64,
        14: 72,
        15: 80,
        16: 96,
      },
      weight: {
        1: '300',
        2: '400',
        3: '500',
        4: '600',
        5: '700',
        6: '800',
        7: '900',
      },
      lineHeight: {
        1: 16,
        2: 20,
        3: 24,
        4: 28,
        5: 32,
        6: 36,
        7: 40,
        8: 44,
        9: 48,
        10: 52,
        11: 60,
        12: 68,
        13: 76,
        14: 84,
        15: 92,
        16: 108,
      },
    },
    heading: {
      family: 'NB International Pro Bold, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      size: {
        1: 12,
        2: 14,
        3: 16,
        4: 18,
        5: 20,
        6: 24,
        7: 28,
        8: 32,
        9: 36,
        10: 40,
        11: 48,
        12: 56,
        13: 64,
        14: 72,
        15: 80,
        16: 96,
      },
      weight: {
        1: '300',
        2: '400',
        3: '500',
        4: '600',
        5: '700',
        6: '800',
        7: '900',
      },
      lineHeight: {
        1: 16,
        2: 20,
        3: 24,
        4: 28,
        5: 32,
        6: 36,
        7: 40,
        8: 44,
        9: 48,
        10: 52,
        11: 60,
        12: 68,
        13: 76,
        14: 84,
        15: 92,
        16: 108,
      },
    },
  },
})

export default tamaguiConfig