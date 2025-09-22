import React, { useState, useEffect } from 'react'
import { View, StyleSheet, Dimensions, Platform, TouchableOpacity } from 'react-native'
import { MotiView } from 'moti'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '../contexts/ThemeContext'
import { useSidebarContext } from '../contexts/SidebarContext'
import { SvgXml } from 'react-native-svg'
import Sidebar from './Sidebar'
import { isSmallScreen, isTablet, responsive, spacing } from '../utils/responsive'

// Better mobile detection
const isMobileScreen = () => {
  if (Platform.OS === 'web') {
    return window.innerWidth < 768
  }
  return SCREEN_WIDTH < 768
}

// Hamburger menu icon
const hamburgerIconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M3 12H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M3 6H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const { width: SCREEN_WIDTH } = Dimensions.get('window')

interface SidebarLayoutProps {
  children: React.ReactNode
  showSidebar?: boolean
  isSidebarOpen?: boolean
  onSidebarToggle?: () => void
}

export default function SidebarLayout({ children, showSidebar = true, isSidebarOpen: externalIsSidebarOpen, onSidebarToggle }: SidebarLayoutProps) {
  // Use context directly - it should always be available
  const { isSidebarOpen } = useSidebarContext()
  const insets = useSafeAreaInsets()
  const { colors, isDarkMode } = useTheme()

  // Handle screen size changes - close sidebar on mobile resize
  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleResize = () => {
        const newWidth = window.innerWidth
        const newIsSmallScreen = newWidth < 768
        
        // Auto-close sidebar when switching to mobile view
        if (newIsSmallScreen && isSidebarOpen) {
          // We'll let the context handle this through the Sidebar component
        }
      }
      
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [isSidebarOpen])

  const handleSidebarToggle = () => {
    // This is now handled by the context, but keep for compatibility
    if (onSidebarToggle) {
      onSidebarToggle()
    }
  }

  const dynamicStyles = {
    container: {
      backgroundColor: colors.background,
    },
    mainContent: {
      backgroundColor: colors.background,
    },
  }

  // Calculate sidebar width for content margin (desktop/tablet only)
  const getSidebarWidth = () => {
    if (!isSidebarOpen) return 0
    
    // On mobile, sidebar is overlay so no margin needed
    if (isMobileScreen()) return 0
    
    // Desktop/tablet: match the actual sidebar width
    if (SCREEN_WIDTH < 1200) {
      return Math.min(SCREEN_WIDTH * 0.35, 260) // Tablet: 35% of screen width, max 260px
    } else {
      return Math.min(SCREEN_WIDTH * 0.25, 300) // Desktop: 25% of screen width, max 300px
    }
  }
  
  const sidebarWidth = getSidebarWidth()

  if (!showSidebar) {
    return (
      <View style={[styles.container, dynamicStyles.container]}>
        {children}
      </View>
    )
  }

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      {/* Sidebar */}
      {showSidebar && (
        <Sidebar 
          isOpen={isSidebarOpen} 
          onToggle={handleSidebarToggle}
        />
      )}
      
      {/* Main Content */}
      <MotiView 
        animate={{
          marginLeft: !isMobileScreen() && isSidebarOpen ? sidebarWidth : 0,
          width: !isMobileScreen() && isSidebarOpen ? SCREEN_WIDTH - sidebarWidth : SCREEN_WIDTH
        }}
        transition={{
          type: 'spring',
          damping: 25,
          stiffness: 400,
          mass: 0.8
        }}
        style={[
          styles.mainContent,
          dynamicStyles.mainContent,
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          }
        ]}
      >
        {/* Page Content */}
        {children}
      </MotiView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    height: '100%',
  },
  mainContent: {
    flex: 1,
    position: 'relative',
    ...Platform.select({
      web: {
        overflowY: 'auto',
        transition: 'margin-left 0.3s ease, width 0.3s ease',
      },
      default: {},
    }),
  },
})
