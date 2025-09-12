import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Platform } from 'react-native'

interface ThemeContextType {
  isDarkMode: boolean
  toggleTheme: () => void
  colors: {
    background: string
    surface: string
    primary: string
    secondary: string
    text: string
    textSecondary: string
    border: string
    card: string
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
  const [isDarkMode, setIsDarkMode] = useState(true) // Default to dark mode

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  // Apply theme to document body and root element for web
  useEffect(() => {
    if (Platform.OS === 'web') {
      const body = document.body
      const root = document.documentElement
      
      if (isDarkMode) {
        body.style.backgroundColor = '#0F0F0F'
        body.style.color = '#FFFFFF'
        root.style.backgroundColor = '#0F0F0F'
        root.style.color = '#FFFFFF'
      } else {
        body.style.backgroundColor = '#FFFFFF'
        body.style.color = '#000000'
        root.style.backgroundColor = '#FFFFFF'
        root.style.color = '#000000'
      }
    }
  }, [isDarkMode])

  const colors = {
    background: isDarkMode ? '#0F0F0F' : '#FFFFFF',
    surface: isDarkMode ? '#1A1A1A' : '#F8F9FA',
    primary: isDarkMode ? '#5252D7' : '#5252D7',
    secondary: isDarkMode ? '#8484FE' : '#8484FE',
    text: isDarkMode ? '#FFFFFF' : '#000000',
    textSecondary: isDarkMode ? '#A7A6A5' : '#6B7280',
    border: isDarkMode ? 'rgba(82, 82, 215, 0.2)' : 'rgba(82, 82, 215, 0.1)',
    card: isDarkMode ? 'rgba(26, 26, 26, 0.8)' : 'rgba(248, 249, 250, 0.8)',
    header: isDarkMode ? 'rgba(82, 82, 215, 0.15)' : 'rgba(82, 82, 215, 0.05)',
    success: isDarkMode ? '#10B981' : '#059669',
    warning: isDarkMode ? '#F59E0B' : '#D97706',
    error: isDarkMode ? '#EF4444' : '#DC2626',
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
