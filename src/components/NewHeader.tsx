import React, { useState, useRef, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image, Alert } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { MotiView } from 'moti'
import { useAccount, useBalance } from '../hooks/usePlatformWagmi'
import { usePrivy, useLogout } from '../hooks/usePlatformAuth'
import { safeTruncateAddress } from '../utils/safeSlice'
import { spacing, fontSizes, responsive } from './ResponsiveLayout'
import { useTheme } from '../contexts/ThemeContext'
import { useSidebarContext } from '../contexts/SidebarContext'
import { useLanguage, languageOptions, Language } from '../contexts/LanguageContext'
import { SvgXml } from 'react-native-svg'
import * as Clipboard from 'expo-clipboard'

// Import SVG assets as strings
const peaqVectorSvg = `<svg width="41" height="22" viewBox="0 0 41 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M31.4507 0.524902H31.0988C26.1847 0.524902 23.2483 3.80864 21.2584 6.67236C20.4939 7.76693 19.778 8.92515 19.1107 10.0452C17.8245 12.158 16.6111 14.1562 15.1672 15.5944C13.6505 17.1218 11.7455 17.9363 9.65848 17.9363C7.95975 17.8854 6.38236 17.1345 5.19325 15.8363C4.00414 14.538 3.36105 12.8325 3.36105 11.0252C3.36105 9.21789 4.07695 7.39783 5.29032 6.09961C6.51583 4.80139 8.16603 4.07592 9.92542 4.07592C10.6413 4.07592 11.4664 4.22865 12.2794 4.49593C12.4371 4.54684 12.5584 4.67412 12.6191 4.8523C12.6677 5.03049 12.6434 5.2214 12.5463 5.37414L8.2995 11.8143C8.16603 12.0052 8.15389 12.2471 8.2631 12.4507C8.3723 12.6544 8.55431 12.7816 8.78485 12.7816H11.1995C11.5271 12.7816 11.8304 12.6162 12.0124 12.3362L16.3927 5.64142C16.5747 5.38687 16.6718 5.0814 16.7446 4.75048C16.7931 4.44502 16.7931 4.1141 16.7446 3.79591C16.6839 3.49044 16.5505 3.18498 16.3806 2.9177C16.1986 2.66315 15.9802 2.44678 15.7132 2.26859C15.5312 2.16677 15.3492 2.05222 15.1551 1.93767C13.5413 1.02128 11.7212 0.524902 9.88902 0.524902C7.25599 0.524902 4.7807 1.60675 2.9121 3.59227C1.06777 5.5396 0 8.22513 0 10.9998C0 13.7744 0.970702 16.3072 2.7665 18.2672C4.5623 20.24 6.95265 21.3728 9.53714 21.4492C12.3158 21.4492 14.7668 20.4437 17.0237 18.3563C19.0257 16.5108 20.5789 14.0926 21.8772 11.9798C22.8843 10.3379 23.8307 8.78515 24.8621 7.51238C25.2261 7.06691 25.578 6.67236 25.9177 6.32871C27.483 4.78866 29.1332 4.07592 31.0988 4.07592H31.3415C33.0403 4.12683 34.6176 4.86503 35.8068 6.17598C36.8139 7.28328 37.4691 8.77242 37.6147 10.3252C37.6389 10.5543 37.6511 10.7834 37.6511 11.0252C37.6511 12.8707 36.9595 14.6144 35.7218 15.9254C34.4963 17.2236 32.8461 17.9491 31.0867 17.9491C30.1767 17.9491 29.303 17.72 28.7328 17.529C28.575 17.4781 28.4537 17.3509 28.393 17.1727C28.3445 16.9945 28.3687 16.8036 28.4658 16.6381L32.7005 10.2616C32.834 10.0706 32.8461 9.82881 32.7369 9.62517C32.6398 9.4088 32.4457 9.29425 32.2152 9.29425H29.8005C29.4729 9.29425 29.1817 9.45971 28.9876 9.73972L24.6073 16.3581C24.4253 16.6254 24.3282 16.9181 24.2554 17.249C24.2069 17.5545 24.2069 17.8854 24.2554 18.2036C24.3161 18.5091 24.4495 18.8145 24.6194 19.0818C24.7893 19.3364 25.032 19.5655 25.2989 19.7309C25.4809 19.8327 25.6508 19.9473 25.8328 20.0618C27.4466 20.991 29.2666 21.4746 31.0988 21.4746C33.744 21.4746 36.2193 20.3928 38.0879 18.4073C39.9565 16.4345 41 13.8253 41 11.0379C41 8.25059 39.9929 5.65415 38.2214 3.71954C36.4256 1.73403 34.0352 0.601268 31.4507 0.524902Z" fill="currentColor"/>
</svg>`

const walletIconSvg = `<svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M19.1834 11C19.137 11 19.0905 11 19.0463 11C17.1396 11 16.0071 12.2398 15.2329 13.318C14.9365 13.7321 14.6622 14.1688 14.3968 14.5919C13.8969 15.3904 13.4257 16.1434 12.8705 16.687C12.2822 17.2625 11.5433 17.5674 10.7338 17.5674C10.0746 17.5492 9.4597 17.2671 9.00404 16.7758C8.54616 16.2867 8.294 15.6429 8.294 14.9605C8.29621 14.2666 8.56828 13.5887 9.04164 13.1042C9.52163 12.6106 10.1587 12.3399 10.8355 12.3376H10.84C11.1142 12.3376 11.4394 12.3945 11.7557 12.4991C11.8176 12.5196 11.8663 12.5673 11.8884 12.6333C11.9105 12.6993 11.8995 12.7721 11.8597 12.8289L10.2118 15.263C10.1631 15.3358 10.1587 15.4268 10.1985 15.5041C10.2383 15.5815 10.3135 15.6292 10.3976 15.6292H11.3332C11.4593 15.6292 11.5787 15.5656 11.6495 15.4586L13.3505 12.9313C13.4191 12.8312 13.4633 12.7198 13.4877 12.5992C13.5098 12.4786 13.5098 12.3581 13.4855 12.2398C13.4611 12.1192 13.4125 12.01 13.3439 11.9099C13.2753 11.8098 13.1891 11.7279 13.0873 11.6642C13.0187 11.621 12.9479 11.5801 12.8727 11.5391C12.249 11.1911 11.5433 11.0068 10.8333 11.0068C9.8114 11.0068 8.85141 11.4186 8.1281 12.1624C7.41585 12.8949 7.00443 13.914 7.00001 14.9605C6.9978 15.9887 7.37825 16.9623 8.07281 17.7016C8.76514 18.4455 9.69638 18.8731 10.6962 18.9004C11.7712 18.9004 12.7201 18.5182 13.596 17.7357C14.3769 17.0351 14.9741 16.1251 15.474 15.329C15.8633 14.7079 16.2283 14.1233 16.6286 13.6388C16.768 13.4682 16.9029 13.3226 17.0401 13.1906C17.6461 12.6083 18.2854 12.3376 19.0507 12.3376C19.0839 12.3376 19.1149 12.3376 19.148 12.3376C19.8072 12.3558 20.4221 12.6379 20.8778 13.1292C21.2715 13.5501 21.5193 14.1074 21.5768 14.6966C21.5856 14.783 21.59 14.8717 21.59 14.9582C21.5878 15.6566 21.3224 16.3117 20.8424 16.8053C20.3624 17.2989 19.7254 17.5697 19.0485 17.5719H19.0441C18.6946 17.5719 18.3539 17.4855 18.1305 17.4127C18.0686 17.3922 18.0199 17.3444 17.9978 17.2785C17.9757 17.2125 17.9868 17.1397 18.0266 17.0806L19.6678 14.6738C19.7165 14.601 19.7232 14.51 19.6833 14.4327C19.6435 14.3531 19.5683 14.3076 19.482 14.3076H18.5486C18.4225 14.3076 18.3053 14.3713 18.2323 14.4782L16.5335 16.9805C16.4649 17.0806 16.4207 17.1921 16.3964 17.3126C16.3743 17.4332 16.3743 17.5538 16.3986 17.672C16.4229 17.7926 16.4716 17.9018 16.5401 18.0019C16.6065 18.0974 16.6994 18.1862 16.8012 18.2498C16.872 18.293 16.9383 18.334 17.0091 18.3727C17.6328 18.7207 18.3384 18.905 19.0485 18.905C20.0726 18.905 21.0326 18.4932 21.756 17.7494C22.4793 17.0055 22.8796 16.0183 22.8818 14.965C22.8841 13.9413 22.4925 12.9336 21.8068 12.2034C21.1145 11.4572 20.1833 11.0318 19.1834 11Z" fill="currentColor"/>
</svg>`

const logoutIconSvg = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4.16667 17.5C3.70833 17.5 3.31597 17.3368 2.98958 17.0104C2.66319 16.684 2.5 16.2917 2.5 15.8333V4.16667C2.5 3.70833 2.66319 3.31597 2.98958 2.98958C3.31597 2.66319 3.70833 2.5 4.16667 2.5H10V4.16667H4.16667V15.8333H10V17.5H4.16667ZM13.3333 14.1667L12.1875 12.9583L14.3125 10.8333H7.5V9.16667H14.3125L12.1875 7.04167L13.3333 5.83333L17.5 10L13.3333 14.1667Z" fill="currentColor"/>
</svg>`

const copyAddressSvg = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M13.332 5.33301H6.66536C5.92898 5.33301 5.33203 5.92996 5.33203 6.66634V13.333C5.33203 14.0694 5.92898 14.6663 6.66536 14.6663H13.332C14.0684 14.6663 14.6654 14.0694 14.6654 13.333V6.66634C14.6654 5.92996 14.0684 5.33301 13.332 5.33301Z" stroke="currentColor" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M2.66536 10.6663C1.93203 10.6663 1.33203 10.0663 1.33203 9.33301V2.66634C1.33203 1.93301 1.93203 1.33301 2.66536 1.33301H9.33203C10.0654 1.33301 10.6654 1.93301 10.6654 2.66634" stroke="currentColor" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

interface NewHeaderProps {
  onSidebarToggle?: () => void
}

export default function NewHeader({ onSidebarToggle }: NewHeaderProps) {
  // Use sidebar context as primary, fallback to prop
  const { toggleSidebar: contextToggleSidebar } = useSidebarContext()
  const { address } = useAccount()
  const { data: balance } = useBalance({ address })
  const { authenticated, user: privyUser } = usePrivy()
  const { logout } = useLogout()
  const { colors, isDarkMode, toggleTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)
  const [isClicking, setIsClicking] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const menuRef = useRef<View>(null)

  const userAddress = address || ''
  const balanceFormatted = balance ? parseFloat(balance.formatted).toFixed(2) : '0.0'

  // Extract user avatar from different authentication methods (from UserInfoHeader)
  const getUserAvatar = () => {
    // Check Google authentication for avatar
    if (privyUser?.google && (privyUser.google as any)?.picture) {
      return (privyUser.google as any).picture
    }
    
    // Check Apple authentication for avatar
    if (privyUser?.apple && (privyUser.apple as any)?.picture) {
      return (privyUser.apple as any).picture
    }
    
    // Check Twitter authentication for avatar
    if (privyUser?.twitter && (privyUser.twitter as any)?.profilePictureUrl) {
      return (privyUser.twitter as any).profilePictureUrl
    }
    
    // No avatar found, use default
    return null
  }
  
  const userAvatar = getUserAvatar()

  // Extract user name and email from different authentication methods (from UserInfoHeader)
  const getUserInfo = () => {
    // Check Google authentication
    if (privyUser?.google && (privyUser.google as any)?.name && (privyUser.google as any)?.email) {
      return {
        name: (privyUser.google as any).name,
        email: (privyUser.google as any).email
      }
    }
    
    // Check Apple authentication
    if (privyUser?.apple && (privyUser.apple as any)?.name && (privyUser.apple as any)?.email) {
      return {
        name: (privyUser.apple as any).name,
        email: (privyUser.apple as any).email
      }
    }
    
    // Check Twitter authentication
    if (privyUser?.twitter && (privyUser.twitter as any)?.name) {
      return {
        name: (privyUser.twitter as any).name,
        email: (privyUser.twitter as any).username || (privyUser.twitter as any).subject || 'twitter@example.com'
      }
    }
    
    // Fallback to linked accounts
    if (privyUser?.linkedAccounts && privyUser.linkedAccounts.length > 0) {
      const googleAccount = privyUser.linkedAccounts.find(account => account.type === 'google_oauth')
      if (googleAccount) {
        return {
          name: googleAccount.name,
          email: googleAccount.email
        }
      }
    }
    
    // Final fallback
    return {
      name: 'User',
      email: 'user@example.com'
    }
  }

  const { name: userName, email: userEmail } = getUserInfo()

  const handleLogout = async () => {
    try {
      await logout()
      setShowUserMenu(false)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleCopyAddress = async () => {
    try {
      if (!userAddress) {
        Alert.alert(t('common.error'), t('header.noWalletAddress'))
        return
      }
      
      if (Platform.OS === 'web') {
        // Use navigator.clipboard for web
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(userAddress)
          Alert.alert(t('header.copied'), t('header.copyAddress'))
        } else {
          // Fallback for older browsers
          const textArea = document.createElement('textarea')
          textArea.value = userAddress
          document.body.appendChild(textArea)
          textArea.select()
          document.execCommand('copy')
          document.body.removeChild(textArea)
          Alert.alert(t('header.copied'), t('header.copyAddress'))
        }
      } else {
        // Use React Native Clipboard for mobile
        await Clipboard.setStringAsync(userAddress)
        Alert.alert(t('header.copied'), t('header.copyAddress'))
      }
    } catch (error) {
      console.error('Copy failed:', error)
      Alert.alert(t('header.copyFailed'), t('common.tryAgain'))
    }
  }

  const handleLanguageSelect = (newLanguage: Language) => {
    setLanguage(newLanguage)
    setShowLanguageMenu(false)
  }

  const getCurrentLanguageOption = () => {
    return languageOptions.find(option => option.code === language) || languageOptions[0]
  }

  // Scroll detection for header background transition
  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleScroll = () => {
        const scrollY = window.scrollY || document.documentElement.scrollTop
        const shouldBeScrolled = scrollY > 50
        setIsScrolled(shouldBeScrolled) // Transition after 50px of scroll
      }

      window.addEventListener('scroll', handleScroll, { passive: true })
      
      return () => {
        window.removeEventListener('scroll', handleScroll)
      }
    }
  }, [])

  // Close menu when clicking outside (web only)
  React.useEffect(() => {
    if (Platform.OS === 'web') {
      const handleClickOutside = (event: any) => {
        if (showUserMenu || showLanguageMenu) {
          const target = event.target as Element
          if (target && !target.closest('[data-user-menu]') && !target.closest('[data-profile-button]')) {
            setTimeout(() => {
              setShowUserMenu(false)
            }, 100)
          }
          if (target && !target.closest('[data-language-menu]') && !target.closest('[data-language-button]')) {
            setTimeout(() => {
              setShowLanguageMenu(false)
            }, 100)
          }
        }
      }

      if (showUserMenu || showLanguageMenu) {
        document.addEventListener('mousedown', handleClickOutside)
        return () => {
          document.removeEventListener('mousedown', handleClickOutside)
        }
      }
    }
  }, [showUserMenu, showLanguageMenu])

  // Create dynamic styles based on theme
  const dynamicStyles = React.useMemo(() => StyleSheet.create({
    headerContainer: {
      ...styles.headerContainer,
      backgroundColor: isScrolled 
        ? (isDarkMode ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)') // Solid when scrolled
        : 'transparent', // Transparent when at top
      borderBottomColor: isScrolled ? colors.border : 'transparent',
      shadowColor: isScrolled ? '#000' : 'transparent',
      shadowOffset: isScrolled ? { width: 0, height: 2 } : { width: 0, height: 0 },
      shadowOpacity: isScrolled ? 0.1 : 0,
      shadowRadius: isScrolled ? 8 : 0,
      elevation: isScrolled ? 4 : 0,
    },
    walletButton: {
      ...styles.walletButton,
      backgroundColor: colors.card,
      borderColor: colors.border,
    },
    walletBalance: {
      ...styles.walletBalance,
      color: colors.foreground,
    },
    walletAddress: {
      ...styles.walletAddress,
      color: colors.mutedForeground,
    },
    dropdownArrow: {
      ...styles.dropdownArrow,
      color: colors.mutedForeground,
    },
    dropdownContent: {
      ...styles.dropdownContent,
      backgroundColor: colors.card,
      borderColor: colors.border,
    },
    menuText: {
      ...styles.menuText,
      color: colors.foreground,
    },
    themeSwitch: {
      ...styles.themeSwitch,
      backgroundColor: colors.muted,
    },
    themeSwitchTrack: {
      ...styles.themeSwitchTrack,
      backgroundColor: isDarkMode ? colors.peaqPurple : colors.peaqActionBg,
    },
    themeSwitchThumb: {
      ...styles.themeSwitchThumb,
      backgroundColor: colors.card,
      shadowColor: colors.foreground,
    },
    languageButton: {
      ...styles.languageButton,
      backgroundColor: isDarkMode ? 'rgba(55, 65, 81, 0.9)' : colors.card,
      borderWidth: 1,
      borderColor: isDarkMode ? 'rgba(156, 163, 175, 0.3)' : colors.border,
      shadowColor: isDarkMode ? '#000' : 'rgba(0, 0, 0, 0.1)',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDarkMode ? 0.3 : 0.1,
      shadowRadius: 4,
      elevation: isDarkMode ? 3 : 1,
    },
    languageCode: {
      ...styles.languageCode,
      color: colors.foreground,
    },
    languageDropdown: {
      ...styles.languageDropdown,
      backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.95)' : colors.popover,
      borderWidth: 1,
      borderColor: isDarkMode ? 'rgba(156, 163, 175, 0.4)' : colors.border,
      shadowColor: isDarkMode ? '#000' : '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDarkMode ? 0.5 : 0.25,
      shadowRadius: 8,
      elevation: isDarkMode ? 8 : 5,
    },
    languageOption: {
      ...styles.languageOption,
      backgroundColor: 'transparent',
    },
    languageOptionActive: {
      backgroundColor: isDarkMode ? 'rgba(102, 102, 254, 0.2)' : colors.peaqActionBg,
    },
    languageOptionText: {
      ...styles.languageOptionText,
      color: isDarkMode ? colors.foreground : colors.popoverForeground,
    },
    hamburgerButton: {
      ...styles.hamburgerButton,
      backgroundColor: isDarkMode ? colors.peaqActionBg : colors.peaqActionBg,
      borderColor: isDarkMode ? colors.peaqPurple : colors.peaqPurple,
    },
  }), [colors, isDarkMode, isScrolled])

  if (!authenticated || !address) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      height: responsive(60, 70, 80),
    }}>
      <View style={[
        styles.headerContainer, 
        dynamicStyles.headerContainer,
        Platform.OS === 'web' && {
          backgroundColor: isScrolled 
            ? (isDarkMode ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)')
            : 'transparent',
          boxShadow: isScrolled 
            ? '0 2px 8px rgba(0, 0, 0, 0.1)' 
            : 'none',
        }
      ]}>
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
          {/* Left side - Hamburger + Peaq Logo */}
          <View style={styles.logoContainer}>
            <TouchableOpacity
              style={[styles.hamburgerButton, dynamicStyles.hamburgerButton]}
              onPress={() => {
                const toggleFunction = contextToggleSidebar || onSidebarToggle
                if (toggleFunction) {
                  toggleFunction()
                }
              }}
              activeOpacity={0.7}
            >
              <SvgXml 
                xml={`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M3 12H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M3 6H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`}
                width={responsive(20, 22, 24)} 
                height={responsive(20, 22, 24)}
                color={colors.peaqPurple}
              />
            </TouchableOpacity>
            <SvgXml 
              xml={peaqVectorSvg} 
              width={responsive(28, 32, 36)} 
              height={responsive(15, 17, 19)}
              color={colors.foreground}
            />
          </View>

          {/* Center - Controls (Language + Theme) */}
          <View style={styles.centerSection}>
            {/* Language Selector */}
            <View style={styles.languageSelector}>
              <TouchableOpacity
                style={[styles.languageButton, dynamicStyles.languageButton]}
                onPress={() => setShowLanguageMenu(!showLanguageMenu)}
                activeOpacity={0.8}
                {...(Platform.OS === 'web' && { 'data-language-button': true })}
              >
                <Text style={styles.languageFlag}>
                  {getCurrentLanguageOption().flag}
                </Text>
                <Text style={[styles.languageCode, dynamicStyles.languageCode]}>
                  {getCurrentLanguageOption().code.toUpperCase()}
                </Text>
              </TouchableOpacity>

              {/* Language Dropdown */}
              {showLanguageMenu && (
                <View 
                  style={[styles.languageDropdown, dynamicStyles.languageDropdown]}
                  {...(Platform.OS === 'web' && { 'data-language-menu': true })}
                >
                  {languageOptions.map((option) => (
                    <TouchableOpacity
                      key={option.code}
                      style={[
                        styles.languageOption,
                        dynamicStyles.languageOption,
                        language === option.code && dynamicStyles.languageOptionActive
                      ]}
                      onPress={() => handleLanguageSelect(option.code)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.languageOptionFlag, { fontSize: responsive(16, 18, 20) }]}>
                        {option.flag}
                      </Text>
                      <Text style={[styles.languageOptionText, dynamicStyles.languageOptionText]}>
                        {option.name}
                      </Text>
                      {language === option.code && (
                        <Text style={[styles.languageOptionCheck, { color: dynamicStyles.languageOptionText.color }]}>
                          ✓
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Theme Switch */}
            <TouchableOpacity
              style={[styles.themeSwitch, dynamicStyles.themeSwitch]}
              onPress={toggleTheme}
              activeOpacity={0.8}
            >
              <View style={[styles.themeSwitchTrack, dynamicStyles.themeSwitchTrack]}>
                <MotiView
                  animate={{
                    translateX: isDarkMode ? responsive(20, 22, 24) : 0,
                  }}
                  transition={{
                    type: 'spring',
                    damping: 15,
                    stiffness: 200,
                  }}
                  style={[styles.themeSwitchThumb, dynamicStyles.themeSwitchThumb]}
                >
                  <Text style={styles.themeSwitchIcon}>
                    {isDarkMode ? '🌙' : '☀️'}
                  </Text>
                </MotiView>
              </View>
            </TouchableOpacity>
          </View>

          {/* Right side - Wallet Section */}
          <View style={styles.walletSection}>
            <TouchableOpacity
              style={[styles.walletButton, dynamicStyles.walletButton]}
              onPress={() => {
                if (!isClicking) {
                  setIsClicking(true)
                  setShowUserMenu(!showUserMenu)
                  setTimeout(() => setIsClicking(false), 200)
                }
              }}
              activeOpacity={0.8}
              data-profile-button="true"
            >
              <View style={styles.walletContent}>
                {/* User Avatar or Wallet Icon */}
                <View style={styles.avatarContainer}>
                  {userAvatar ? (
                    <Image source={{ uri: userAvatar }} style={styles.avatar} resizeMode="cover" />
                  ) : (
                    <SvgXml 
                      xml={walletIconSvg} 
                      width={responsive(14, 16, 18)} 
                      height={responsive(14, 16, 18)}
                      color={colors.peaqPurple}
                    />
                  )}
                </View>
                
                <View style={styles.walletInfo}>
                  <Text style={[styles.walletBalance, dynamicStyles.walletBalance]}>
                    {balanceFormatted} peaq
                  </Text>
                  <Text style={[styles.walletAddress, dynamicStyles.walletAddress]}>
                    {safeTruncateAddress(userAddress)}
                  </Text>
                </View>
                
                <Text style={[styles.dropdownArrow, dynamicStyles.dropdownArrow]}>
                  {showUserMenu ? '▲' : '▼'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* User Menu Dropdown */}
            {showUserMenu && (
              <MotiView
                ref={menuRef}
                from={{ opacity: 0, scale: 0.95, translateY: -10 }}
                animate={{ opacity: 1, scale: 1, translateY: 0 }}
                exit={{ opacity: 0, scale: 0.95, translateY: -10 }}
                transition={{
                  type: 'spring',
                  damping: 15,
                  stiffness: 200,
                }}
                style={styles.dropdown}
                data-user-menu="true"
              >
                <View style={[styles.dropdownContent, dynamicStyles.dropdownContent]}>
                  {/* Purple Gradient Wallet Card */}
                  <LinearGradient
                    colors={[colors.peaqCtaPurple, colors.peaqPurple]}
                    style={styles.walletCard}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={styles.walletCardContent}>
                      <View style={styles.walletCardIconContainer}>
                        {userAvatar ? (
                          <Image source={{ uri: userAvatar }} style={styles.walletCardAvatar} resizeMode="cover" />
                        ) : (
                          <SvgXml 
                            xml={walletIconSvg} 
                            width={24} 
                            height={24}
                            color="#FFFFFF"
                          />
                        )}
                      </View>
                      <View style={styles.walletDetails}>
                        <Text style={styles.walletName}>{userName}</Text>
                        <View style={styles.addressRow}>
                          <Text style={styles.walletFullAddress}>
                            {safeTruncateAddress(userAddress)}
                          </Text>
                          <TouchableOpacity 
                            style={styles.copyButton}
                            onPress={handleCopyAddress}
                            activeOpacity={0.7}
                          >
                            <SvgXml 
                              xml={copyAddressSvg} 
                              width={14} 
                              height={14}
                              color="rgba(255, 255, 255, 0.8)"
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </LinearGradient>

                  {/* Log out */}
                  <TouchableOpacity 
                    style={styles.menuItem} 
                    onPress={() => {
                      setShowUserMenu(false)
                      handleLogout()
                    }}
                    data-logout-button="true"
                  >
                    <SvgXml 
                      xml={logoutIconSvg} 
                      width={16} 
                      height={16}
                      color={colors.mutedForeground}
                    />
                    <Text style={[styles.menuText, dynamicStyles.menuText]}>{t('header.logout')}</Text>
                  </TouchableOpacity>
                </View>
              </MotiView>
            )}
          </View>
        </MotiView>
      </View>
    </div>
  )
}

const styles = StyleSheet.create({
  headerContainer: {
    height: '100%',
    borderBottomWidth: 1,
    paddingHorizontal: responsive(16, 20, 24),
    paddingVertical: responsive(8, 12, 16),
    ...(Platform.OS === 'web' && {
      transition: 'all 0.3s ease',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)', // Safari support
    }),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '100%',
  },
  logoContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: responsive(12, 16, 20),
  },
  hamburgerButton: {
    padding: responsive(6, 8, 10),
    borderRadius: responsive(8, 10, 12),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(102, 102, 254, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(102, 102, 254, 0.2)',
  },
  centerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: responsive(12, 16, 20),
  },
  languageSelector: {
    position: 'relative',
    zIndex: 10,
    alignItems: 'center',
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: responsive(8, 10, 12),
    paddingVertical: responsive(4, 6, 8),
    borderRadius: responsive(8, 10, 12),
    gap: responsive(4, 6, 8),
    minWidth: responsive(50, 60, 70),
    justifyContent: 'center',
  },
  languageFlag: {
    fontSize: responsive(14, 16, 18),
  },
  languageCode: {
    fontSize: responsive(12, 14, 16),
    fontFamily: 'NB International Pro Bold',
    fontWeight: '700',
  },
  languageDropdown: {
    position: 'absolute',
    top: '100%',
    left: responsive(-16, -20, -24),
    right: responsive(-16, -20, -24),
    marginTop: responsive(6, 8, 10),
    borderRadius: responsive(8, 10, 12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: responsive(2, 3, 4) },
    shadowOpacity: 0.25,
    shadowRadius: responsive(4, 6, 8),
    elevation: 5,
    overflow: 'hidden',
    minWidth: responsive(140, 160, 180),
    maxWidth: responsive(200, 240, 280),
    zIndex: 1000,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: responsive(12, 14, 16),
    paddingVertical: responsive(8, 10, 12),
    gap: responsive(8, 10, 12),
  },
  languageOptionFlag: {
    fontSize: responsive(14, 16, 18),
  },
  languageOptionText: {
    fontSize: responsive(12, 14, 16),
    fontFamily: 'NB International Pro',
    flex: 1,
  },
  languageOptionCheck: {
    fontSize: responsive(14, 16, 18),
    fontWeight: 'bold',
    marginLeft: responsive(8, 10, 12),
  },
  themeSwitch: {
    padding: responsive(4, 6, 8),
    borderRadius: responsive(20, 22, 24),
  },
  themeSwitchTrack: {
    width: responsive(44, 48, 52),
    height: responsive(22, 24, 26),
    borderRadius: responsive(11, 12, 13),
    justifyContent: 'center',
    paddingHorizontal: responsive(2, 3, 4),
  },
  themeSwitchThumb: {
    width: responsive(18, 20, 22),
    height: responsive(18, 20, 22),
    borderRadius: responsive(9, 10, 11),
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  themeSwitchIcon: {
    fontSize: responsive(10, 12, 14),
  },
  walletSection: {
    position: 'relative',
    alignItems: 'flex-end',
  },
  walletButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: responsive(12, 14, 16),
    paddingVertical: responsive(8, 10, 12),
    borderRadius: responsive(8, 10, 12),
    borderWidth: 1,
    minWidth: responsive(160, 180, 200),
  },
  walletContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  avatarContainer: {
    width: responsive(24, 26, 28),
    height: responsive(24, 26, 28),
    borderRadius: responsive(12, 13, 14),
    backgroundColor: 'rgba(102, 102, 254, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: responsive(12, 13, 14),
  },
  walletInfo: {
    flex: 1,
    alignItems: 'flex-start',
  },
  walletBalance: {
    fontSize: responsive(fontSizes.xs, fontSizes.sm, fontSizes.md),
    fontFamily: 'NB International Pro',
    fontWeight: '600',
    marginBottom: 2,
  },
  walletAddress: {
    fontSize: responsive(fontSizes.xs, fontSizes.xs, fontSizes.sm),
    fontFamily: 'NB International Pro',
    fontWeight: '400',
  },
  dropdownArrow: {
    fontSize: responsive(8, 10, 12),
    marginLeft: spacing.xs,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: responsive(4, 6, 8),
    zIndex: 1000,
  },
  dropdownContent: {
    borderRadius: responsive(8, 10, 12),
    borderWidth: 1,
    padding: responsive(12, 14, 16),
    minWidth: responsive(200, 220, 240),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  walletCard: {
    borderRadius: responsive(12, 14, 16),
    padding: responsive(16, 18, 20),
    marginBottom: responsive(12, 14, 16),
  },
  walletCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletCardIconContainer: {
    width: responsive(32, 36, 40),
    height: responsive(32, 36, 40),
    borderRadius: responsive(16, 18, 20),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    overflow: 'hidden',
  },
  walletCardAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: responsive(16, 18, 20),
  },
  walletDetails: {
    flex: 1,
  },
  walletName: {
    fontSize: responsive(fontSizes.md, fontSizes.lg, fontSizes.xl),
    fontFamily: 'NB International Pro',
    fontWeight: '600',
    marginBottom: 2,
    color: '#FFFFFF',
  },
  walletFullAddress: {
    fontSize: responsive(fontSizes.sm, fontSizes.md, fontSizes.lg),
    fontFamily: 'NB International Pro',
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.8)',
    flex: 1,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  copyButton: {
    padding: responsive(4, 6, 8),
    borderRadius: responsive(4, 6, 8),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginLeft: spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: responsive(8, 10, 12),
    paddingHorizontal: responsive(4, 6, 8),
  },
  menuText: {
    fontSize: responsive(fontSizes.sm, fontSizes.md, fontSizes.lg),
    fontFamily: 'NB International Pro',
    fontWeight: '400',
    marginLeft: spacing.sm,
    flex: 1,
  },
})
