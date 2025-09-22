import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Platform } from 'react-native'

interface ThemeContextType {
  isDarkMode: boolean
  toggleTheme: () => void
  colors: {
    // Core design system colors (OKLCH converted to hex)
    background: string
    foreground: string
    card: string
    cardForeground: string
    popover: string
    popoverForeground: string
    primary: string
    primaryForeground: string
    secondary: string
    secondaryForeground: string
    muted: string
    mutedForeground: string
    accent: string
    accentForeground: string
    destructive: string
    border: string
    input: string
    ring: string
    // Peaq brand colors
    peaqPurple: string
    peaqPurpleHover: string
    peaqDarkPurple: string
    peaqCtaPurple: string
    peaqActionBg: string
    peaqActionBgHover: string
    peaqAssetsBg: string
    peaqDollarSign: string
    peaqPlaceholder: string
    peaqSwapIcon: string
    // Legacy compatibility
    surface: string
    text: string
    textSecondary: string
    header: string
    success: string
    warning: string
    error: string
  }
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [isDarkMode, setIsDarkMode] = useState(false) // Default to dark mode

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  // Apply theme to document body and root element for web
  useEffect(() => {
    if (Platform.OS === 'web') {
      const body = document.body
      const root = document.documentElement
      
      // Apply theme class to body for CSS gradients
      if (isDarkMode) {
        body.className = 'dark'
        body.style.background = 'linear-gradient(135deg, #1F2937 0%, #374151 25%, #4B5563 50%, #374151 75%, #1F2937 100%)'
        body.style.color = '#FBFBFB'
        root.style.background = 'linear-gradient(135deg, #1F2937 0%, #374151 25%, #4B5563 50%, #374151 75%, #1F2937 100%)'
        root.style.color = '#FBFBFB'
        root.className = 'dark'
      } else {
        body.className = ''
        body.style.background = 'linear-gradient(135deg, #E5E7EB 0%, #F3F4F6 25%, #FFFFFF 50%, #F9FAFB 75%, #E5E7EB 100%)'
        body.style.color = '#252525'
        root.style.background = 'linear-gradient(135deg, #E5E7EB 0%, #F3F4F6 25%, #FFFFFF 50%, #F9FAFB 75%, #E5E7EB 100%)'
        root.style.color = '#252525'
        root.className = ''
      }
      
      // Force background attachment
      body.style.backgroundAttachment = 'fixed'
      body.style.backgroundRepeat = 'no-repeat'
      body.style.backgroundSize = 'cover'
    }
  }, [isDarkMode])

  const colors = {
    // Core design system colors (OKLCH converted to hex)
    background: isDarkMode ? 'transparent' : 'transparent',
    foreground: isDarkMode ? '#FBFBFB' : '#252525',
    card: isDarkMode ? '#343434' : '#FFFFFF',
    cardForeground: isDarkMode ? '#FBFBFB' : '#252525',
    popover: isDarkMode ? '#343434' : '#FFFFFF',
    popoverForeground: isDarkMode ? '#FBFBFB' : '#252525',
    primary: isDarkMode ? '#EBEBEB' : '#343434',
    primaryForeground: isDarkMode ? '#343434' : '#FBFBFB',
    secondary: isDarkMode ? '#444444' : '#F7F7F7',
    secondaryForeground: isDarkMode ? '#FBFBFB' : '#343434',
    muted: isDarkMode ? '#444444' : '#F7F7F7',
    mutedForeground: isDarkMode ? '#B5B5B5' : '#8E8E8E',
    accent: isDarkMode ? '#444444' : '#F7F7F7',
    accentForeground: isDarkMode ? '#FBFBFB' : '#343434',
    destructive: isDarkMode ? '#C73E1D' : '#DC2626',
    border: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#EBEBEB',
    input: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : '#EBEBEB',
    ring: isDarkMode ? '#8E8E8E' : '#B5B5B5',

    // Peaq brand colors
    peaqPurple: '#6666FE',
    peaqPurpleHover: '#5555ED',
    peaqDarkPurple: '#2F1D74',
    peaqCtaPurple: '#8484FE',
    peaqActionBg: '#F0F0FF',
    peaqActionBgHover: '#E0E0FF',
    peaqAssetsBg: '#F8F7F6',
    peaqDollarSign: '#A7A6A5',
    peaqPlaceholder: '#747372',
    peaqSwapIcon: '#5B5A59',

    // Legacy compatibility (mapped to new system)
    surface: isDarkMode ? '#343434' : '#FFFFFF',
    text: isDarkMode ? '#FBFBFB' : '#252525',
    textSecondary: isDarkMode ? '#B5B5B5' : '#8E8E8E',
    header: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#F7F7F7',
    success: '#10B981',
    warning: '#F59E0B',
    error: isDarkMode ? '#C73E1D' : '#DC2626',
  }

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
