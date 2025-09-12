/**
 * TransactionErrorHandler - Component for handling blockchain transaction errors
 * 
 * This component demonstrates how to use the improved error handling
 * in the MachineManagerContext to provide better user experience.
 */

import React from 'react'
import { useMachineManager } from '../contexts/MachineManagerContext'

interface TransactionErrorHandlerProps {
  children: React.ReactNode
}

export function TransactionErrorHandler({ children }: TransactionErrorHandlerProps) {
  const { 
    approveTransaction, 
    useMachineTransaction, 
    clearTransactionState, 
    retryLastTransaction 
  } = useMachineManager()

  // Handle approve transaction errors
  React.useEffect(() => {
    if (approveTransaction.status === 'error') {
      console.error('Approve transaction failed:', approveTransaction.error)
      
      // Show user-friendly error message
      if (approveTransaction.userFriendlyError) {
        alert(`Approve Error: ${approveTransaction.userFriendlyError}`)
      }
      
      // Auto-clear error after 5 seconds
      const timer = setTimeout(() => {
        clearTransactionState('approve')
      }, 5000)
      
      return () => clearTimeout(timer)
    }
  }, [approveTransaction, clearTransactionState])

  // Handle use machine transaction errors
  React.useEffect(() => {
    if (useMachineTransaction.status === 'error') {
      console.error('Use machine transaction failed:', useMachineTransaction.error)
      
      // Show user-friendly error message
      if (useMachineTransaction.userFriendlyError) {
        alert(`Machine Error: ${useMachineTransaction.userFriendlyError}`)
      }
      
      // Auto-clear error after 5 seconds
      const timer = setTimeout(() => {
        clearTransactionState('useMachine')
      }, 5000)
      
      return () => clearTimeout(timer)
    }
  }, [useMachineTransaction, clearTransactionState])

  return <>{children}</>
}

// Example usage component
export function MachineInteractionExample() {
  const { 
    interactWithMachine, 
    approveTransaction, 
    useMachineTransaction,
    retryLastTransaction 
  } = useMachineManager()

  const handleUseMachine = async () => {
    try {
      const result = await interactWithMachine('1', '0x...', '1.0')
      
      if (result.success) {
        console.log('Transaction successful:', result.transactionHash)
      } else {
        console.error('Transaction failed:', result.userFriendlyError)
      }
    } catch (error) {
      console.error('Unexpected error:', error)
    }
  }

  const handleRetry = async () => {
    try {
      await retryLastTransaction()
    } catch (error) {
      console.error('Retry failed:', error)
    }
  }

  return (
    <div>
      <button onClick={handleUseMachine} disabled={approveTransaction.status === 'pending' || useMachineTransaction.status === 'pending'}>
        Use Machine
      </button>
      
      {(approveTransaction.status === 'error' || useMachineTransaction.status === 'error') && (
        <button onClick={handleRetry}>
          Retry Transaction
        </button>
      )}
      
      {approveTransaction.status === 'pending' && (
        <p>Approving tokens...</p>
      )}
      
      {useMachineTransaction.status === 'pending' && (
        <p>Using machine...</p>
      )}
    </div>
  )
}
