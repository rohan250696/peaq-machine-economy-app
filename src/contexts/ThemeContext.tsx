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
        body.style.backgroundColor = '#FAFBFC'
        body.style.color = '#1F2937'
        root.style.backgroundColor = '#FAFBFC'
        root.style.color = '#1F2937'
      }
    }
  }, [isDarkMode])

  const colors = {
    background: isDarkMode ? '#0F0F0F' : '#FAFBFC',
    surface: isDarkMode ? '#1A1A1A' : '#F1F3F4',
    primary: isDarkMode ? '#5252D7' : '#4F46E5',
    secondary: isDarkMode ? '#8484FE' : '#6366F1',
    text: isDarkMode ? '#FFFFFF' : '#1F2937',
    textSecondary: isDarkMode ? '#A7A6A5' : '#6B7280',
    border: isDarkMode ? 'rgba(82, 82, 215, 0.2)' : 'rgba(79, 70, 229, 0.15)',
    card: isDarkMode ? 'rgba(26, 26, 26, 0.8)' : 'rgba(255, 255, 255, 0.9)',
    header: isDarkMode ? 'rgba(82, 82, 215, 0.15)' : 'rgba(79, 70, 229, 0.08)',
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
