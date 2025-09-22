import React, { useState, useEffect, useRef } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, Platform, Clipboard } from 'react-native'
import { MotiView } from 'moti'
import { usePrivy, useWallets, useLogout } from '../hooks/usePlatformAuth'
import { useAccount, useBalance } from '../hooks/usePlatformWagmi'
import { safeTruncateAddress } from '../utils/safeSlice'
import { spacing, fontSizes, responsive } from './ResponsiveLayout'
import { useTheme } from '../contexts/ThemeContext'
import { useProfitTokenBalance } from '../contexts/MachineManagerContext'
import { formatEther } from 'viem'
import { SvgXml } from 'react-native-svg'
import PeaqLogo from './PeaqLogo'
import PeaqSharingTokenIcon from './PeaqSharingTokenIcon'

// Import SVG assets as strings
const peaqVectorSvg = `<svg width="41" height="22" viewBox="0 0 41 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M31.4507 0.524902H31.0988C26.1847 0.524902 23.2483 3.80864 21.2584 6.67236C20.4939 7.76693 19.778 8.92515 19.1107 10.0452C17.8245 12.158 16.6111 14.1562 15.1672 15.5944C13.6505 17.1218 11.7455 17.9363 9.65848 17.9363C7.95975 17.8854 6.38236 17.1345 5.19325 15.8363C4.00414 14.538 3.36105 12.8325 3.36105 11.0252C3.36105 9.21789 4.07695 7.39783 5.29032 6.09961C6.51583 4.80139 8.16603 4.07592 9.92542 4.07592C10.6413 4.07592 11.4664 4.22865 12.2794 4.49593C12.4371 4.54684 12.5584 4.67412 12.6191 4.8523C12.6677 5.03049 12.6434 5.2214 12.5463 5.37414L8.2995 11.8143C8.16603 12.0052 8.15389 12.2471 8.2631 12.4507C8.3723 12.6544 8.55431 12.7816 8.78485 12.7816H11.1995C11.5271 12.7816 11.8304 12.6162 12.0124 12.3362L16.3927 5.64142C16.5747 5.38687 16.6718 5.0814 16.7446 4.75048C16.7931 4.44502 16.7931 4.1141 16.7446 3.79591C16.6839 3.49044 16.5505 3.18498 16.3806 2.9177C16.1986 2.66315 15.9802 2.44678 15.7132 2.26859C15.5312 2.16677 15.3492 2.05222 15.1551 1.93767C13.5413 1.02128 11.7212 0.524902 9.88902 0.524902C7.25599 0.524902 4.7807 1.60675 2.9121 3.59227C1.06777 5.5396 0 8.22513 0 10.9998C0 13.7744 0.970702 16.3072 2.7665 18.2672C4.5623 20.24 6.95265 21.3728 9.53714 21.4492C12.3158 21.4492 14.7668 20.4437 17.0237 18.3563C19.0257 16.5108 20.5789 14.0926 21.8772 11.9798C22.8843 10.3379 23.8307 8.78515 24.8621 7.51238C25.2261 7.06691 25.578 6.67236 25.9177 6.32871C27.483 4.78866 29.1332 4.07592 31.0988 4.07592H31.3415C33.0403 4.12683 34.6176 4.86503 35.8068 6.17598C36.8139 7.28328 37.4691 8.77242 37.6147 10.3252C37.6389 10.5543 37.6511 10.7834 37.6511 11.0252C37.6511 12.8707 36.9595 14.6144 35.7218 15.9254C34.4963 17.2236 32.8461 17.9491 31.0867 17.9491C30.1767 17.9491 29.303 17.72 28.7328 17.529C28.575 17.4781 28.4537 17.3509 28.393 17.1727C28.3445 16.9945 28.3687 16.8036 28.4658 16.6381L32.7005 10.2616C32.834 10.0706 32.8461 9.82881 32.7369 9.62517C32.6398 9.4088 32.4457 9.29425 32.2152 9.29425H29.8005C29.4729 9.29425 29.1817 9.45971 28.9876 9.73972L24.6073 16.3581C24.4253 16.6254 24.3282 16.9181 24.2554 17.249C24.2069 17.5545 24.2069 17.8854 24.2554 18.2036C24.3161 18.5091 24.4495 18.8145 24.6194 19.0818C24.7893 19.3364 25.032 19.5655 25.2989 19.7309C25.4809 19.8327 25.6508 19.9473 25.8328 20.0618C27.4466 20.991 29.2666 21.4746 31.0988 21.4746C33.744 21.4746 36.2193 20.3928 38.0879 18.4073C39.9565 16.4345 41 13.8253 41 11.0379C41 8.25059 39.9929 5.65415 38.2214 3.71954C36.4256 1.73403 34.0352 0.601268 31.4507 0.524902Z" fill="currentColor"/>
</svg>`

const walletIconSvg = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<mask id="mask0_1819_6281" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="18" height="18">
<rect width="18" height="18" fill="#D9D9D9"/>
</mask>
<g mask="url(#mask0_1819_6281)">
<path d="M4.5 15C3.675 15 2.96875 14.7063 2.38125 14.1187C1.79375 13.5312 1.5 12.825 1.5 12V6C1.5 5.175 1.79375 4.46875 2.38125 3.88125C2.96875 3.29375 3.675 3 4.5 3H13.5C14.325 3 15.0313 3.29375 15.6188 3.88125C16.2063 4.46875 16.5 5.175 16.5 6V12C16.5 12.825 16.2063 13.5312 15.6188 14.1187C15.0313 14.7063 14.325 15 13.5 15H4.5ZM4.5 6H13.5C13.775 6 14.0375 6.03125 14.2875 6.09375C14.5375 6.15625 14.775 6.25625 15 6.39375V6C15 5.5875 14.8531 5.23438 14.5594 4.94063C14.2656 4.64688 13.9125 4.5 13.5 4.5H4.5C4.0875 4.5 3.73438 4.64688 3.44063 4.94063C3.14688 5.23438 3 5.5875 3 6V6.39375C3.225 6.25625 3.4625 6.15625 3.7125 6.09375C3.9625 6.03125 4.225 6 4.5 6ZM3.1125 8.4375L11.4563 10.4625C11.5688 10.4875 11.6813 10.4875 11.7938 10.4625C11.9062 10.4375 12.0125 10.3875 12.1125 10.3125L14.7188 8.1375C14.5813 7.95 14.4063 7.79688 14.1938 7.67813C13.9813 7.55938 13.75 7.5 13.5 7.5H4.5C4.175 7.5 3.89062 7.58437 3.64687 7.75313C3.40312 7.92188 3.225 8.15 3.1125 8.4375Z" fill="currentColor"/>
</g>
</svg>`

export default function UserInfoHeader() {
  const { authenticated, user: privyUser } = usePrivy()
  const { wallets } = useWallets()
  const { logout } = useLogout()
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({ address })
  const { balance: profitTokenBalance, isLoading: profitTokenLoading } = useProfitTokenBalance(address)
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

  const handleCopyAddress = async () => {
    try {
      
      if (!userAddress) {
        Alert.alert('Error', 'No wallet address available')
        return
      }
      
      if (Platform.OS === 'web') {
        // Use navigator.clipboard for web
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(userAddress)
          Alert.alert('Copied!', 'Wallet address copied to clipboard')
        } else {
          // Fallback for older browsers
          const textArea = document.createElement('textarea')
          textArea.value = userAddress
          document.body.appendChild(textArea)
          textArea.select()
          document.execCommand('copy')
          document.body.removeChild(textArea)
          Alert.alert('Copied!', 'Wallet address copied to clipboard')
        }
      } else {
        // Use React Native Clipboard for mobile
        await Clipboard.setString(userAddress)
        Alert.alert('Copied!', 'Wallet address copied to clipboard')
      }
    } catch (error) {
      console.error('Copy failed:', error)
      Alert.alert('Copy Failed', 'Please try again')
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
  const userAddress = address || wallets[0]?.address || ''
  const balanceFormatted = balance ? parseFloat(balance.formatted).toFixed(2) : '0.0'
  const profitTokenFormatted = profitTokenBalance ? parseFloat(profitTokenBalance) : '0.0'
  
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
    if (privyUser?.twitter && (privyUser.twitter as any)?.profilePictureUrl) {
      return (privyUser.twitter as any).profilePictureUrl
    }
    
    // No avatar found, use default
    return null
  }
  
  const userAvatar = getUserAvatar()

  // Create dynamic styles based on theme - use useMemo to ensure they update when theme changes
  const dynamicStyles = React.useMemo(() => StyleSheet.create({
    profileGradient: {
      ...styles.profileGradient,
      backgroundColor: colors.peaqActionBg,
      borderColor: colors.border,
    },
    profileName: {
      ...styles.profileName,
      color: colors.foreground,
    },
    profileAddress: {
      ...styles.profileAddress,
      color: colors.mutedForeground,
    },
    userMenu: {
      ...styles.userMenu,
      backgroundColor: colors.card,
      borderColor: colors.border,
    },
    menuUserName: {
      ...styles.menuUserName,
      color: colors.cardForeground,
    },
    menuUserEmail: {
      ...styles.menuUserEmail,
      color: colors.mutedForeground,
    },
    menuUserAddress: {
      ...styles.menuUserAddress,
      color: colors.mutedForeground,
    },
    balanceAmount: {
      ...styles.balanceAmount,
      color: colors.peaqPurple,
    },
    themeText: {
      ...styles.themeText,
      color: colors.peaqPurple,
    },
    logoutText: {
      ...styles.logoutText,
      color: colors.destructive,
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
                  <View style={styles.addressContainer}>
                    <Text style={dynamicStyles.menuUserAddress}>
                      {safeTruncateAddress(userAddress)}
                    </Text>
                    <TouchableOpacity 
                      style={styles.copyButton}
                      onPress={handleCopyAddress}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.copyIcon}>📋</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Separator */}
              <View style={styles.separator} />

              {/* Balance Section */}
              <View style={styles.balanceSection}>
                <Text style={styles.balanceSectionTitle}>Token Balances</Text>
                
                {/* Native PEAQ Balance */}
                <View style={styles.balanceInfo}>
                  <View style={styles.balanceLogoContainer}>
                    <PeaqLogo size="small" />
                  </View>
                  <View style={styles.balanceDetails}>
                    <Text style={styles.balanceLabel}>peaq</Text>
                    <Text style={dynamicStyles.balanceAmount}>{balanceFormatted}</Text>
                  </View>
                </View>

                {/* Profit Sharing Token Balance */}
                <View style={styles.balanceInfo}>
                  <View style={styles.balanceLogoContainer}>
                    <PeaqSharingTokenIcon size={responsive(32, 36, 40)} />
                  </View>
                  <View style={styles.balanceDetails}>
                    <Text style={styles.balanceLabel}>peaqPFT</Text>
                    <Text style={dynamicStyles.balanceAmount}>
                      {profitTokenLoading ? 'Loading...' : profitTokenFormatted}
                    </Text>
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
                  <View style={styles.addressContainer}>
                    <Text style={dynamicStyles.menuUserAddress}>
                      {safeTruncateAddress(userAddress)}
                    </Text>
                    <TouchableOpacity 
                      style={styles.copyButton}
                      onPress={handleCopyAddress}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.copyIcon}>📋</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Separator */}
              <View style={styles.separator} />

              {/* Balance Section */}
              <View style={styles.balanceSection}>
                <Text style={styles.balanceSectionTitle}>Token Balances</Text>
                
                {/* Native PEAQ Balance */}
                <View style={styles.balanceInfo}>
                  <View style={styles.balanceLogoContainer}>
                    <PeaqLogo size="small" />
                  </View>
                  <View style={styles.balanceDetails}>
                    <Text style={styles.balanceLabel}>peaq</Text>
                    <Text style={dynamicStyles.balanceAmount}>{balanceFormatted}</Text>
                  </View>
                </View>

                {/* Profit Sharing Token Balance */}
                <View style={styles.balanceInfo}>
                  <View style={styles.balanceLogoContainer}>
                    <PeaqSharingTokenIcon size={responsive(32, 36, 40)} />
                  </View>
                  <View style={styles.balanceDetails}>
                    <Text style={styles.balanceLabel}>peaqPFT</Text>
                    <Text style={dynamicStyles.balanceAmount}>
                      {profitTokenLoading ? 'Loading...' : profitTokenFormatted}
                    </Text>
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
    flex: 1,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  copyButton: {
    marginLeft: spacing.sm,
    padding: spacing.xs,
    borderRadius: 6,
    backgroundColor: 'rgba(82, 82, 215, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(82, 82, 215, 0.3)',
    minWidth: 32,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  copyIcon: {
    fontSize: fontSizes.xs,
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
  balanceSectionTitle: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: '#6B7280',
    fontFamily: 'NB International Pro',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  balanceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.xs,
  },
  balanceLogoContainer: {
    padding: spacing.xs,
    borderRadius: 8,
    backgroundColor: 'rgba(82, 82, 215, 0.1)',
    minWidth: 32,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceDetails: {
    marginLeft: spacing.md,
    flex: 1,
  },
  balanceLabel: {
    fontSize: fontSizes.xs,
    color: '#9CA3AF',
    fontFamily: 'NB International Pro',
    marginBottom: 2,
  },
  balanceAmount: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: '#5252D7',
    fontFamily: 'NB International Pro Bold',
  },
  tokenIcon: {
    fontSize: fontSizes.sm,
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
