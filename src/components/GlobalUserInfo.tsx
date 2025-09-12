import React, { useState, createContext, useContext } from 'react'
import { View, StyleSheet } from 'react-native'
import { usePrivy } from '../hooks/usePlatformAuth'
import { useAccount } from 'wagmi'
import FixedHeader from './FixedHeader'
import CopyFeedback from './CopyFeedback'

interface GlobalUserInfoProps {
  children: React.ReactNode
}

// Create context for global copy feedback
interface CopyFeedbackContextType {
  showCopyFeedback: () => void
}

const CopyFeedbackContext = createContext<CopyFeedbackContextType | null>(null)

export const useCopyFeedback = () => {
  const context = useContext(CopyFeedbackContext)
  if (!context) {
    throw new Error('useCopyFeedback must be used within GlobalUserInfo')
  }
  return context
}

export default function GlobalUserInfo({ children }: GlobalUserInfoProps) {
  const { authenticated } = usePrivy()
  const { isConnected } = useAccount()
  const [showCopyFeedback, setShowCopyFeedback] = useState(false)

  const handleShowCopyFeedback = () => {
    setShowCopyFeedback(true)
  }

  return (
    <CopyFeedbackContext.Provider value={{ showCopyFeedback: handleShowCopyFeedback }}>
      <View style={styles.container}>
        {children}
        {/* Show FixedHeader on all screens after login */}
        {authenticated && isConnected && <FixedHeader />}
        {/* Global Copy Feedback */}
        <CopyFeedback 
          visible={showCopyFeedback} 
          onHide={() => setShowCopyFeedback(false)} 
        />
      </View>
    </CopyFeedbackContext.Provider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
})
