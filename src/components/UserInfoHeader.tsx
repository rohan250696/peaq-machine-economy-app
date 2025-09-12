import React, { useState, useEffect, useRef } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, Platform } from 'react-native'
import { MotiView } from 'moti'
import { usePrivy, useWallets, useLogout } from '../hooks/usePlatformAuth'
import { useAccount, useBalance } from '../hooks/usePlatformWagmi'
import { safeTruncateAddress } from '../utils/safeSlice'
import PeaqLogo from './PeaqLogo'
import { spacing, fontSizes, responsive } from './ResponsiveLayout'
import { useTheme } from '../contexts/ThemeContext'

export default function UserInfoHeader() {
  const { authenticated, user: privyUser } = usePrivy()
  const { wallets } = useWallets()
  const { logout } = useLogout()
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({ address })
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef<View>(null)
  const [isClicking, setIsClicking] = useState(false)
  const { isDarkMode, toggleTheme, colors } = useTheme()

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (showUserMenu) {
        const target = event.target as Element
        // Check if click is outside the user menu - be more permissive
        if (target && !target.closest('[data-user-menu]') && !target.closest('[data-profile-button]')) {
          // Add a small delay to allow button clicks to complete
          setTimeout(() => {
            setShowUserMenu(false)
          }, 100)
        }
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [showUserMenu])

  if (!authenticated || !isConnected) return null

  const handleLogout = async () => {
    try {
      await logout()
      setShowUserMenu(false)
    } catch (error) {
      console.error('Logout failed:', error)
      Alert.alert('Logout Failed', 'Please try again')
    }
  }


  // Extract user name and email from different authentication methods
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
    if (privyUser?.twitter && (privyUser.twitter as any)?.name && (privyUser.twitter as any)?.email) {
      return {
        name: (privyUser.twitter as any).name,
        email: (privyUser.twitter as any).email
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
  const userAddress = address || wallets[0]?.address || ''
  const balanceFormatted = balance ? parseFloat(balance.formatted).toFixed(2) : '0.00'
  
  // Extract user avatar from different authentication methods
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
    if (privyUser?.twitter && (privyUser.twitter as any)?.profileImageUrl) {
      return (privyUser.twitter as any).profileImageUrl
    }
    
    // No avatar found, use default
    return null
  }
  
  const userAvatar = getUserAvatar()

  // Create dynamic styles based on theme - use useMemo to ensure they update when theme changes
  const dynamicStyles = React.useMemo(() => StyleSheet.create({
    profileGradient: {
      ...styles.profileGradient,
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    profileName: {
      ...styles.profileName,
      color: colors.text,
    },
    profileAddress: {
      ...styles.profileAddress,
      color: colors.textSecondary,
    },
    userMenu: {
      ...styles.userMenu,
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    menuUserName: {
      ...styles.menuUserName,
      color: colors.text,
    },
    menuUserEmail: {
      ...styles.menuUserEmail,
      color: colors.textSecondary,
    },
    menuUserAddress: {
      ...styles.menuUserAddress,
      color: colors.textSecondary,
    },
    balanceAmount: {
      ...styles.balanceAmount,
      color: colors.primary,
    },
    themeText: {
      ...styles.themeText,
      color: colors.primary,
    },
    logoutText: {
      ...styles.logoutText,
      color: colors.error,
    },
  }), [colors])

  if (Platform.OS === 'web') {
    return (
      <View style={styles.webContainer}>
      <MotiView
        from={{ opacity: 0, translateX: 50 }}
        animate={{ opacity: 1, translateX: 0 }}
        transition={{
          type: 'spring',
          damping: 15,
          stiffness: 100,
        }}
        style={styles.userInfo}
      >
        {/* User Profile Button */}
            <TouchableOpacity
              style={styles.profileButton}
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
          <View style={dynamicStyles.profileGradient}>
            <View style={styles.profileContent}>
              <View style={styles.avatarContainer}>
                {userAvatar ? (
                  <Image source={{ uri: userAvatar }} style={styles.avatar} resizeMode="cover" />
                ) : (
                  <Image source={require('../../assets/avatar-icon.svg')} style={styles.avatarIcon} resizeMode="contain" />
                )}
              </View>
              <View style={styles.profileText}>
                <Text style={dynamicStyles.profileName} numberOfLines={1}>{userName}</Text>
                <Text style={dynamicStyles.profileAddress}>
                  {safeTruncateAddress(userAddress)}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* User Menu Dropdown */}
        {showUserMenu && (
          <MotiView
            ref={menuRef}
            from={{ opacity: 0, scale: 0.8, translateY: -10 }}
            animate={{ opacity: 1, scale: 1, translateY: 0 }}
            exit={{ opacity: 0, scale: 0.8, translateY: -10 }}
            transition={{
              type: 'spring',
              damping: 15,
              stiffness: 200,
            }}
            style={styles.userMenuContainer}
            data-user-menu="true"
          >
            <View 
          style={dynamicStyles.userMenu}
          aria-hidden={!showUserMenu}
        >
              {/* User Profile Section */}
              <View style={styles.userProfileSection}>
                <View style={styles.userProfileAvatar}>
                  {userAvatar ? (
                    <Image source={{ uri: userAvatar }} style={styles.menuAvatar} resizeMode="cover" />
                  ) : (
                    <Image source={require('../../assets/avatar-icon.svg')} style={styles.menuAvatarIcon} resizeMode="contain" />
                  )}
                </View>
                <View style={styles.userProfileInfo}>
                  <Text style={dynamicStyles.menuUserName}>{userName}</Text>
                  <Text style={dynamicStyles.menuUserEmail}>{userEmail}</Text>
                  <Text style={dynamicStyles.menuUserAddress}>
                    {safeTruncateAddress(userAddress)}
                  </Text>
                </View>
              </View>

              {/* Separator */}
              <View style={styles.separator} />

              {/* Balance Section */}
              <View style={styles.balanceSection}>
                <View style={styles.balanceInfo}>
                  <View style={styles.balanceLogoContainer}>
                    <PeaqLogo size="small" />
                  </View>
                  <View style={styles.balanceDetails}>
                    <Text style={dynamicStyles.balanceAmount}>{balanceFormatted}</Text>
                  </View>
                </View>
              </View>

              {/* Separator */}
              <View style={styles.separator} />

              {/* Theme Toggle */}
              <TouchableOpacity 
                style={[styles.themeMenuItem, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }]} 
                onPress={() => {
                  toggleTheme()
                }}
                activeOpacity={0.5}
                data-theme-toggle="true"
              >
                <Text style={styles.themeIcon}>{isDarkMode ? '🌙' : '☀️'}</Text>
                <Text style={dynamicStyles.themeText}>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</Text>
              </TouchableOpacity>

              {/* Separator */}
              <View style={styles.separator} />

              {/* Logout */}
              <TouchableOpacity 
                style={styles.logoutMenuItem} 
                onPress={handleLogout}
                data-logout-button="true"
              >
                <Text style={styles.logoutIcon}>🚪</Text>
                <Text style={dynamicStyles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </MotiView>
        )}
      </MotiView>
    </View>
    )
  }

  // Mobile version
  return (
    <View style={styles.mobileContainer}>
      <MotiView
        from={{ opacity: 0, translateX: 50 }}
        animate={{ opacity: 1, translateX: 0 }}
        transition={{
          type: 'spring',
          damping: 15,
          stiffness: 100,
        }}
        style={styles.userInfo}
      >
        {/* User Profile Button */}
            <TouchableOpacity
              style={styles.profileButton}
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
          <View style={dynamicStyles.profileGradient}>
            <View style={styles.profileContent}>
              <View style={styles.avatarContainer}>
                {userAvatar ? (
                  <Image source={{ uri: userAvatar }} style={styles.avatar} resizeMode="cover" />
                ) : (
                  <Image source={require('../../assets/avatar-icon.svg')} style={styles.avatarIcon} resizeMode="contain" />
                )}
              </View>
              <View style={styles.profileText}>
                <Text style={dynamicStyles.profileName} numberOfLines={1}>{userName}</Text>
                <Text style={dynamicStyles.profileAddress}>
                  {safeTruncateAddress(userAddress)}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* User Menu Dropdown */}
        {showUserMenu && (
          <MotiView
            ref={menuRef}
            from={{ opacity: 0, scale: 0.8, translateY: -10 }}
            animate={{ opacity: 1, scale: 1, translateY: 0 }}
            exit={{ opacity: 0, scale: 0.8, translateY: -10 }}
            transition={{
              type: 'spring',
              damping: 15,
              stiffness: 200,
            }}
            style={styles.userMenuContainer}
            data-user-menu="true"
          >
            <View 
          style={dynamicStyles.userMenu}
          aria-hidden={!showUserMenu}
        >
              {/* User Profile Section */}
              <View style={styles.userProfileSection}>
                <View style={styles.userProfileAvatar}>
                  {userAvatar ? (
                    <Image source={{ uri: userAvatar }} style={styles.menuAvatar} resizeMode="cover" />
                  ) : (
                    <Image source={require('../../assets/avatar-icon.svg')} style={styles.menuAvatarIcon} resizeMode="contain" />
                  )}
                </View>
                <View style={styles.userProfileInfo}>
                  <Text style={dynamicStyles.menuUserName}>{userName}</Text>
                  <Text style={dynamicStyles.menuUserEmail}>{userEmail}</Text>
                  <Text style={dynamicStyles.menuUserAddress}>
                    {safeTruncateAddress(userAddress)}
                  </Text>
                </View>
              </View>

              {/* Separator */}
              <View style={styles.separator} />

              {/* Balance Section */}
              <View style={styles.balanceSection}>
                <View style={styles.balanceInfo}>
                  <View style={styles.balanceLogoContainer}>
                    <PeaqLogo size="small" />
                  </View>
                  <View style={styles.balanceDetails}>
                    <Text style={dynamicStyles.balanceAmount}>{balanceFormatted}</Text>
                  </View>
                </View>
              </View>

              {/* Separator */}
              <View style={styles.separator} />

              {/* Theme Toggle */}
              <TouchableOpacity 
                style={[styles.themeMenuItem, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }]} 
                onPress={() => {
                  toggleTheme()
                }}
                activeOpacity={0.5}
                data-theme-toggle="true"
              >
                <Text style={styles.themeIcon}>{isDarkMode ? '🌙' : '☀️'}</Text>
                <Text style={dynamicStyles.themeText}>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</Text>
              </TouchableOpacity>

              {/* Separator */}
              <View style={styles.separator} />

              {/* Logout */}
              <TouchableOpacity 
                style={styles.logoutMenuItem} 
                onPress={handleLogout}
                data-logout-button="true"
              >
                <Text style={styles.logoutIcon}>🚪</Text>
                <Text style={dynamicStyles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </MotiView>
        )}
      </MotiView>
    </View>
  )
}

const styles = StyleSheet.create({
  webContainer: {
    position: 'relative' as const,
  },
  mobileContainer: {
    position: 'relative' as const,
  },
  userInfo: {
    alignItems: 'flex-end',
  },
  
  // Profile Button Styles
  profileButton: {
    borderRadius: responsive(16, 20, 24),
    borderWidth: 1,
    borderColor: 'rgba(82, 82, 215, 0.3)',
    maxWidth: responsive(180, 200, 220),
    minWidth: responsive(140, 160, 180),
  },
  profileGradient: {
    borderRadius: responsive(16, 20, 24),
    padding: responsive(spacing.sm, spacing.md, spacing.lg),
    backgroundColor: 'rgba(82, 82, 215, 0.2)',
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: spacing.sm,
    width: responsive(40, 44, 48),
    height: responsive(40, 44, 48),
    borderRadius: responsive(20, 22, 24),
    borderWidth: 2,
    borderColor: 'rgba(82, 82, 215, 0.3)',
    backgroundColor: 'rgba(82, 82, 215, 0.1)',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: responsive(18, 20, 22),
  } as any,
  avatarIcon: {
    width: '100%',
    height: '100%',
    borderRadius: responsive(18, 20, 22),
  } as any,
  profileText: {
    alignItems: 'flex-start',
  },
  profileName: {
    fontSize: responsive(fontSizes.xs, fontSizes.sm, fontSizes.sm),
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'NB International Pro',
    maxWidth: responsive(80, 100, 120),
    flexShrink: 0,
  },
  profileAddress: {
    fontSize: responsive(fontSizes.xs, fontSizes.xs, fontSizes.xs),
    color: '#A7A6A5',
    fontFamily: 'NB International Pro',
    marginTop: responsive(spacing.xs, spacing.sm, spacing.sm),
    flexShrink: 0,
  },

  // User Menu Styles
  userMenuContainer: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: spacing.sm,
    minWidth: responsive(260, 280, 300),
    maxWidth: responsive(300, 320, 340),
    zIndex: 1001,
  },
  userMenu: {
    borderRadius: 16,
    padding: responsive(spacing.lg, spacing.xl, spacing.xxl),
    borderWidth: 1,
    borderColor: 'rgba(82, 82, 215, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },

  // User Profile Section
  userProfileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  userProfileAvatar: {
    marginRight: spacing.lg,
    width: responsive(60, 64, 68),
    height: responsive(60, 64, 68),
    borderRadius: responsive(30, 32, 34),
    borderWidth: 2,
    borderColor: 'rgba(82, 82, 215, 0.3)',
    backgroundColor: 'rgba(82, 82, 215, 0.1)',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: responsive(28, 30, 32),
  } as any,
  menuAvatarIcon: {
    width: '100%',
    height: '100%',
    borderRadius: responsive(28, 30, 32),
  } as any,
  userProfileInfo: {
    flex: 1,
    paddingVertical: spacing.xs,
  },
  menuUserName: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: '#1F2937',
    fontFamily: 'NB International Pro Bold',
    marginBottom: spacing.xs,
  },
  menuUserEmail: {
    fontSize: fontSizes.sm,
    color: '#6B7280',
    fontFamily: 'NB International Pro',
    marginBottom: spacing.xs,
  },
  menuUserAddress: {
    fontSize: fontSizes.xs,
    color: '#9CA3AF',
    fontFamily: 'NB International Pro',
    marginTop: spacing.xs,
  },

  // Separator
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: spacing.md,
  },

  // Balance Section
  balanceSection: {
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
  },
  balanceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  balanceLogoContainer: {
    padding: spacing.xs,
    borderRadius: 8,
    backgroundColor: 'rgba(82, 82, 215, 0.1)',
  },
  balanceDetails: {
    marginLeft: spacing.md,
    flex: 1,
  },
  balanceAmount: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: '#5252D7',
    fontFamily: 'NB International Pro Bold',
  },


  // Theme Toggle Menu Item
  themeMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
  },
  themeIcon: {
    fontSize: fontSizes.md,
    marginRight: spacing.sm,
    width: 20,
  },
  themeText: {
    fontSize: fontSizes.md,
    color: '#5252D7',
    fontFamily: 'NB International Pro',
    fontWeight: '600',
  },

  // Logout Menu Item
  logoutMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
  },
  logoutIcon: {
    fontSize: fontSizes.md,
    marginRight: spacing.sm,
    width: 20,
  },
  logoutText: {
    fontSize: fontSizes.md,
    color: '#EF4444',
    fontFamily: 'NB International Pro',
    fontWeight: '600',
  },
})
