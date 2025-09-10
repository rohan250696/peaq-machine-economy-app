import React, { createContext, useContext, useEffect, useState } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { User } from '../types'
import { peaqChain } from '../config/chains'

interface PrivyContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (method: 'google' | 'apple' | 'twitter') => Promise<void>
  logout: () => Promise<void>
  walletAddress: string | null
  currentChain: typeof peaqChain
  switchToPeaqChain: () => Promise<void>
}

const PrivyContext = createContext<PrivyContextType | undefined>(undefined)

export const usePrivyAuth = () => {
  const context = useContext(PrivyContext)
  if (!context) {
    throw new Error('usePrivyAuth must be used within a PrivyProvider')
  }
  return context
}

interface PrivyProviderProps {
  children: React.ReactNode
}

export const PrivyAuthProvider: React.FC<PrivyProviderProps> = ({ children }) => {
  const { ready, authenticated, user: privyUser, login: privyLogin, logout: privyLogout } = usePrivy()
  const { wallets } = useWallets()
  const [isLoading, setIsLoading] = useState(true)

  // Get the primary wallet address
  const walletAddress = wallets[0]?.address || null

  // Convert Privy user to our User type
  const user: User | null = privyUser ? {
    id: privyUser.id,
    walletAddress: walletAddress || '',
    email: privyUser.email?.address || undefined,
    name: privyUser.google?.name || privyUser.twitter?.name || undefined,
    avatar: privyUser.twitter?.profilePictureUrl || undefined,
    isAuthenticated: authenticated,
  } : null

  useEffect(() => {
    if (ready) {
      setIsLoading(false)
    }
  }, [ready])

  const login = async (method: 'google' | 'apple' | 'twitter') => {
    setIsLoading(true)
    try {
      await privyLogin()
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      await privyLogout()
    } catch (error) {
      console.error('Logout failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const switchToPeaqChain = async () => {
    try {
      const wallet = wallets[0]
      if (wallet && wallet.switchChain) {
        await wallet.switchChain(peaqChain.id)
      }
    } catch (error) {
      console.error('Failed to switch to Peaq chain:', error)
      throw error
    }
  }

  const value: PrivyContextType = {
    user,
    isAuthenticated: authenticated,
    isLoading,
    login,
    logout,
    walletAddress,
    currentChain: peaqChain,
    switchToPeaqChain,
  }

  return (
    <PrivyContext.Provider value={value}>
      {children}
    </PrivyContext.Provider>
  )
}
