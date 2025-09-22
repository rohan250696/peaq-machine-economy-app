import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native'
import { MotiView } from 'moti'
import { useNavigation, useRoute } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { RootStackParamList } from '../types'
import { useTheme } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useSidebarContext } from '../contexts/SidebarContext'
import { SvgXml } from 'react-native-svg'
import { responsive, spacing, fontSizes, isSmallScreen, isTablet } from '../utils/responsive'

// Enhanced responsive screen detection
const isMobileScreen = () => {
  if (Platform.OS === 'web') {
    return window.innerWidth < 768
  }
  return SCREEN_WIDTH < 768
}

const isTabletScreen = () => {
  if (Platform.OS === 'web') {
    return window.innerWidth >= 768 && window.innerWidth < 1200
  }
  return SCREEN_WIDTH >= 768 && SCREEN_WIDTH < 1200
}

const isDesktopScreen = () => {
  if (Platform.OS === 'web') {
    return window.innerWidth >= 1200
  }
  return SCREEN_WIDTH >= 1200
}

const { width: SCREEN_WIDTH } = Dimensions.get('window')

// SVG Icons for navigation
const machineIconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
<path d="M12 16C14.2091 16 16 17.7909 16 20V22H8V20C8 17.7909 9.79086 16 12 16Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
</svg>`

const dashboardIconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
<rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
<rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
<rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
</svg>`

const menuIconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M3 12H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M3 6H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const closeIconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const peaqLogoSvg = `<svg width="32" height="32" viewBox="0 0 36 37" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M18 0.5L36 18.5L18 36.5L0 18.5L18 0.5Z" fill="currentColor"/>
<path d="M18 8.5L28 18.5L18 28.5L8 18.5L18 8.5Z" fill="white"/>
</svg>`

type SidebarNavigationProp = StackNavigationProp<RootStackParamList>

interface SidebarProps {
  isOpen?: boolean
  onToggle?: () => void
}

interface NavigationItem {
  id: string
  label: string
  icon: string
  route: keyof RootStackParamList
  description?: string
}

// Navigation items will be created inside the component to access translations

export default function Sidebar({ isOpen = false, onToggle }: SidebarProps) {
  const navigation = useNavigation<SidebarNavigationProp>()
  const route = useRoute()
  const { colors, isDarkMode } = useTheme()
  const { t } = useLanguage()
  const { closeSidebar } = useSidebarContext()
  const [isCollapsed, setIsCollapsed] = useState(false) // Start expanded to show full content

  // Navigation items with translations
  const navigationItems: NavigationItem[] = [
    {
      id: 'machines',
      label: t('nav.machineSelection'),
      icon: machineIconSvg,
      route: 'MachineSelection',
      description: t('machines.availableForPurchase')
    },
    {
      id: 'dashboard',
      label: t('nav.dashboard'),
      icon: dashboardIconSvg,
      route: 'Dashboard',
      description: t('dashboard.userPftEarnings')
    }
  ]

  // Handle window resize for desktop collapse behavior only
  useEffect(() => {
    // Don't auto-collapse, let user control the collapse state
    // Only handle window resize for web
    if (Platform.OS === 'web') {
      const handleResize = () => {
        const newWidth = window.innerWidth
        const newIsMobile = newWidth < 768
        // Only auto-collapse on very small screens (< 600px)
        if (newWidth < 600) {
          setIsCollapsed(false) // Always show full content
        }
      }
      
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])

  const handleNavigation = (item: NavigationItem) => {
    // Close sidebar first for smoother animation, then navigate
    if (closeSidebar) {
      closeSidebar()
    } else if (onToggle) {
      onToggle()
    }
    
    // Navigate after a short delay to allow closing animation to start
    setTimeout(() => {
      navigation.navigate(item.route as any)
    }, 150) // Slightly longer delay for smoother animation
  }

  const isActiveRoute = (routeName: string) => {
    return route.name === routeName
  }

  // Responsive sidebar width based on screen size and open state
  const getSidebarWidth = () => {
    if (!isOpen) return 0 // Completely hidden when closed
    
    // Responsive widths based on screen size
    if (isMobileScreen()) {
      return Math.min(SCREEN_WIDTH * 0.8, 280) // Mobile: 80% of screen width, max 280px
    } else if (isTabletScreen()) {
      return Math.min(SCREEN_WIDTH * 0.35, 260) // Tablet: 35% of screen width, max 260px
    } else {
      return Math.min(SCREEN_WIDTH * 0.25, 300) // Desktop: 25% of screen width, max 300px
    }
  }
  
  const sidebarWidth = getSidebarWidth()

  const dynamicStyles = {
    sidebar: {
      backgroundColor: colors.card,
      borderRightColor: colors.border,
    },
    header: {
      borderBottomColor: colors.border,
    },
    logoText: {
      color: colors.foreground,
    },
    navItem: {
      backgroundColor: 'transparent',
    },
    navItemActive: {
      backgroundColor: colors.peaqPurple,
    },
    navItemHover: {
      backgroundColor: colors.peaqActionBg,
    },
    navItemText: {
      color: colors.mutedForeground,
    },
    navItemTextActive: {
      color: colors.primaryForeground,
    },
    navItemDescription: {
      color: colors.mutedForeground,
    },
    footer: {
      borderTopColor: colors.border,
    },
    footerText: {
      color: colors.mutedForeground,
    },
    overlay: {
      backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.4)',
    }
  }

  // If sidebar is not open, don't render anything at all
  if (!isOpen) {
    return null
  }

  // Mobile overlay sidebar
  if (isMobileScreen()) {
    return (
      <>
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ 
            type: 'timing', 
            duration: 300
          }}
          style={[styles.overlay, dynamicStyles.overlay]}
        >
          <TouchableOpacity
            style={styles.overlayTouchable}
            onPress={() => {
              if (closeSidebar) {
                closeSidebar()
              } else if (onToggle) {
                onToggle()
              }
            }}
            activeOpacity={1}
          />
        </MotiView>
        
        <MotiView
          from={{ translateX: -sidebarWidth }}
          animate={{ translateX: 0 }}
          exit={{ translateX: -sidebarWidth }}
          transition={{ 
            type: 'spring',
            damping: 20,
            stiffness: 300
          }}
          style={[styles.sidebar, styles.mobileSidebar, dynamicStyles.sidebar, { width: sidebarWidth }]}
        >
          <SidebarContent
            navigationItems={navigationItems}
            isCollapsed={isCollapsed}
            isActiveRoute={isActiveRoute}
            handleNavigation={handleNavigation}
            onToggle={onToggle}
            closeSidebar={closeSidebar}
            isOpen={isOpen}
            dynamicStyles={dynamicStyles}
            colors={colors}
            isDarkMode={isDarkMode}
          />
        </MotiView>
      </>
    )
  }

  // Desktop sidebar
  return (
    <MotiView
      from={{ width: 0, opacity: 0, translateX: -20 }}
      animate={{ width: sidebarWidth, opacity: 1, translateX: 0 }}
      exit={{ width: 0, opacity: 0, translateX: -20 }}
      transition={{ 
        type: 'spring',
        damping: 25,
        stiffness: 400,
        mass: 0.8
      }}
      style={[styles.sidebar, styles.desktopSidebar, dynamicStyles.sidebar]}
    >
        <SidebarContent
          navigationItems={navigationItems}
          isCollapsed={isCollapsed}
          isActiveRoute={isActiveRoute}
          handleNavigation={handleNavigation}
          onToggle={() => setIsCollapsed(!isCollapsed)}
          closeSidebar={closeSidebar}
          isOpen={true}
          dynamicStyles={dynamicStyles}
          colors={colors}
          isDarkMode={isDarkMode}
        />
    </MotiView>
  )
}

interface SidebarContentProps {
  navigationItems: NavigationItem[]
  isCollapsed: boolean
  isActiveRoute: (routeName: string) => boolean
  handleNavigation: (item: NavigationItem) => void
  onToggle?: () => void
  closeSidebar?: () => void
  isOpen: boolean
  dynamicStyles: any
  colors: any
  isDarkMode: boolean
}

function SidebarContent({
  navigationItems,
  isCollapsed,
  isActiveRoute,
  handleNavigation,
  onToggle,
  closeSidebar,
  isOpen,
  dynamicStyles,
  colors,
  isDarkMode
}: SidebarContentProps) {
  return (
    <>
      {/* Header */}
      <View style={[styles.header, dynamicStyles.header]}>
        <View style={styles.headerContent}>
          <SvgXml 
            xml={peaqLogoSvg} 
            width={responsive(24, 28, 32)} 
            height={responsive(24, 28, 32)}
            color={colors.peaqPurple}
          />
          <MotiView
            from={{ opacity: 0, scale: 0.8, translateX: -10 }}
            animate={{ opacity: 1, scale: 1, translateX: 0 }}
            transition={{ 
              type: 'spring',
              damping: 20,
              stiffness: 300,
              delay: 100
            }}
          >
            <Text style={[styles.logoText, dynamicStyles.logoText]}>PEAQ</Text>
          </MotiView>
        </View>
        
        {/* Toggle Button */}
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => {
            if (closeSidebar) {
              closeSidebar()
            } else if (onToggle) {
              onToggle()
            }
          }}
          activeOpacity={0.7}
        >
          <SvgXml 
            xml={isMobileScreen() ? closeIconSvg : menuIconSvg} 
            width={responsive(18, 20, 22)} 
            height={responsive(18, 20, 22)}
            color={colors.mutedForeground}
          />
        </TouchableOpacity>
      </View>

      {/* Navigation */}
      <View style={styles.navigation}>
        {navigationItems.map((item) => {
          const isActive = isActiveRoute(item.route)
          
          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.navItem,
                isActive ? [styles.navItemActive, dynamicStyles.navItemActive] : dynamicStyles.navItem
              ]}
              onPress={() => handleNavigation(item)}
              activeOpacity={0.7}
            >
              <View style={styles.navItemContent}>
                <View style={styles.navItemIcon}>
                  <SvgXml 
                    xml={item.icon} 
                    width={responsive(20, 22, 24)} 
                    height={responsive(20, 22, 24)}
                    color={isActive ? colors.primaryForeground : colors.peaqPurple}
                  />
                </View>
                
                <MotiView
                  from={{ opacity: 0, translateX: -15, scale: 0.95 }}
                  animate={{ opacity: 1, translateX: 0, scale: 1 }}
                  transition={{ 
                    type: 'spring',
                    damping: 20,
                    stiffness: 300,
                    delay: 150
                  }}
                  style={styles.navItemTextContainer}
                >
                  <Text style={[
                    styles.navItemText,
                    isActive ? dynamicStyles.navItemTextActive : dynamicStyles.navItemText
                  ]}>
                    {item.label}
                  </Text>
                  <Text style={[styles.navItemDescription, dynamicStyles.navItemDescription]}>
                    {item.description}
                  </Text>
                </MotiView>
              </View>
              
              {/* Active Indicator */}
              {isActive && (
                <MotiView
                  from={{ scaleY: 0, opacity: 0 }}
                  animate={{ scaleY: 1, opacity: 1 }}
                  transition={{ 
                    type: 'spring',
                    damping: 15,
                    stiffness: 400,
                    delay: 200
                  }}
                  style={[styles.activeIndicator, { backgroundColor: colors.primaryForeground }]}
                />
              )}
            </TouchableOpacity>
          )
        })}
      </View>

      {/* Footer */}
      <View style={[styles.footer, dynamicStyles.footer]}>
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ 
            type: 'spring',
            damping: 20,
            stiffness: 300,
            delay: 200
          }}
        >
          <Text style={[styles.footerText, dynamicStyles.footerText]}>
            Machine Economy
          </Text>
          <Text style={[styles.footerVersion, dynamicStyles.footerText]}>
            v1.0.0
          </Text>
        </MotiView>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  // Main Sidebar
  sidebar: {
    flexDirection: 'column',
    borderRightWidth: 1,
    ...Platform.select({
      web: {
        boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
      }
    }),
  },
  desktopSidebar: {
    height: '100%',
    position: 'relative',
    zIndex: 10,
  },
  mobileSidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    zIndex: 1000,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  overlayTouchable: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: responsive(spacing.md, spacing.lg, spacing.xl),
    borderBottomWidth: 1,
    minHeight: responsive(60, 70, 80),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: responsive(spacing.sm, spacing.md, spacing.lg),
  },
  logoText: {
    fontSize: responsive(fontSizes.lg, fontSizes.xl, fontSizes.xxl),
    fontFamily: 'NB International Pro Bold',
    fontWeight: '700',
    letterSpacing: 1,
  },
  toggleButton: {
    padding: responsive(spacing.xs, spacing.sm, spacing.md),
    borderRadius: responsive(6, 8, 10),
  },

  // Navigation
  navigation: {
    flex: 1,
    paddingVertical: responsive(spacing.sm, spacing.md, spacing.lg),
    gap: responsive(spacing.xs, spacing.sm, spacing.md),
  },
  navItem: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: responsive(spacing.sm, spacing.md, spacing.lg),
    paddingHorizontal: responsive(spacing.md, spacing.lg, spacing.xl),
    marginHorizontal: responsive(spacing.sm, spacing.md, spacing.lg),
    borderRadius: responsive(8, 10, 12),
    minHeight: responsive(44, 48, 52),
    overflow: 'hidden',
  },
  navItemActive: {
    // Dynamic background applied via dynamicStyles
  },
  navItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: responsive(spacing.sm, spacing.md, spacing.lg),
  },
  navItemIcon: {
    width: responsive(24, 26, 28),
    height: responsive(24, 26, 28),
    alignItems: 'center',
    justifyContent: 'center',
  },
  navItemTextContainer: {
    flex: 1,
  },
  navItemText: {
    fontSize: responsive(fontSizes.sm, fontSizes.md, fontSizes.lg),
    fontFamily: 'NB International Pro',
    fontWeight: '600',
    lineHeight: responsive(fontSizes.sm * 1.2, fontSizes.md * 1.2, fontSizes.lg * 1.2),
  },
  navItemDescription: {
    fontSize: responsive(fontSizes.xs, fontSizes.sm, fontSizes.md),
    fontFamily: 'NB International Pro',
    opacity: 0.7,
    marginTop: responsive(2, 3, 4),
    lineHeight: responsive(fontSizes.xs * 1.3, fontSizes.sm * 1.3, fontSizes.md * 1.3),
  },
  activeIndicator: {
    position: 'absolute',
    right: 0,
    top: responsive(spacing.sm, spacing.md, spacing.lg),
    bottom: responsive(spacing.sm, spacing.md, spacing.lg),
    width: responsive(3, 4, 5),
    borderRadius: responsive(2, 3, 4),
  },

  // Footer
  footer: {
    padding: responsive(spacing.md, spacing.lg, spacing.xl),
    borderTopWidth: 1,
    alignItems: 'center',
  },
  footerText: {
    fontSize: responsive(fontSizes.xs, fontSizes.sm, fontSizes.md),
    fontFamily: 'NB International Pro',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: responsive(2, 3, 4),
  },
  footerVersion: {
    fontSize: responsive(fontSizes.xs, fontSizes.xs, fontSizes.sm),
    fontFamily: 'NB International Pro',
    opacity: 0.6,
    textAlign: 'center',
  },
})
