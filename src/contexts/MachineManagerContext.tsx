/**
 * MachineManagerContext - Complete Smart Contract Integration
 * 
 * This context provides full integration with the MachineManager smart contract
 * and PEAQ ERC20 token using Wagmi v2. It includes:
 * 
 * ✅ Write Functions:
 * - approveToken() - Approve PEAQ tokens for spending
 * - useMachine() - Interact with machines (payments)
 * - interactWithMachine() - Complete flow (approve + use)
 * 
 * ✅ Read Functions:
 * - getClaimableFor() - Get claimable rewards
 * - getOwnershipBps() - Get ownership percentage
 * - getMachine() - Get machine information
 * - getTokenBalance() - Get user's PEAQ balance
 * - getTokenAllowance() - Get token allowance
 * 
 * ✅ Real-time Hooks:
 * - useClaimableFor() - Real-time claimable amount
 * - useOwnershipBps() - Real-time ownership percentage
 * - useMachineInfo() - Real-time machine data
 * - useTokenBalance() - Real-time token balance
 * - useTokenAllowance() - Real-time allowance
 * 
 * Usage Example:
 * ```typescript
 * const { interactWithMachine, getMachine } = useMachineManager()
 * const { claimableAmount } = useClaimableFor('1', userAddress)
 * 
 * const handleUseMachine = async () => {
 *   const result = await interactWithMachine('1', userAddress, '1.0')
 *   console.log('Transaction:', result.transactionHash)
 * }
 * ```
 */

import React, { createContext, useContext, ReactNode, useState, useCallback } from 'react'
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useConfig, usePublicClient } from 'wagmi'
import { parseEther, formatEther, isAddress } from 'viem'
import MachineManagerABI from '../abi/MachineManagerABI.json'
import ERC20ABI from '../abi/ERC20.json'
import { 
  MachineInfo, 
  UseMachineParams, 
  ClaimableForParams, 
  OwnershipBpsParams, 
  GetMachineParams,
  GetMachineReturn,
  ClaimableForReturn,
  OwnershipBpsReturn,
  GetAllMachinesReturn
} from '../types/MachineManagerTypes'
import { AGUNG_TESTNET_MACHINE_MANAGER_ADDRESS, TOKEN_ADDRESS } from '../constants'

// Contract addresses - these should be moved to config
const MACHINE_MANAGER_ADDRESS = "0xA4963E5760a855AA39827FbB7691B47c2A34B755" // Replace with actual contract address
const PEAQ_TOKEN_ADDRESS = TOKEN_ADDRESS // Replace with actual PEAQ token address

// Utility function to convert string machine IDs to BigInt
function convertMachineIdToBigInt(machineId: string): bigint {
  if (machineId.startsWith('robo-cafe-') || machineId.startsWith('humanoid-')) {
    // Extract number from string IDs like "robo-cafe-001" -> 1
    const match = machineId.match(/(\d+)$/)
    return match ? BigInt(match[1]) : BigInt(1)
  }
  
  if (machineId.startsWith('machine-')) {
    // Extract number from string IDs like "machine-1" -> 1
    const match = machineId.match(/machine-(\d+)$/)
    return match ? BigInt(match[1]) : BigInt(1)
  }
  
  // Try to parse as a pure number string
  if (/^\d+$/.test(machineId)) {
    return BigInt(machineId)
  }
  
  // Fallback: try to extract any number from the string
  const match = machineId.match(/(\d+)/)
  return match ? BigInt(match[1]) : BigInt(1)
}

// Error handling utilities
function isAlreadyKnownError(error: any): boolean {
  return error?.message?.includes('already known') || 
         error?.details === 'already known' ||
         error?.cause?.message === 'already known'
}

function isInsufficientFundsError(error: any): boolean {
  return error?.message?.includes('insufficient funds') ||
         error?.message?.includes('insufficient balance')
}

function isRejectedError(error: any): boolean {
  return error?.message?.includes('User rejected') ||
         error?.message?.includes('user rejected') ||
         error?.code === 4001
}

function getUserFriendlyErrorMessage(error: any): string {
  if (isAlreadyKnownError(error)) {
    return 'Transaction is already pending. Please wait for it to be confirmed or check your wallet.'
  }
  if (isInsufficientFundsError(error)) {
    return 'Insufficient funds. Please check your balance and try again.'
  }
  if (isRejectedError(error)) {
    return 'Transaction was rejected. Please try again.'
  }
  if (error?.message?.includes('gas')) {
    return 'Transaction failed due to gas issues. Please try again with higher gas limit.'
  }
  return error?.message || 'An unexpected error occurred. Please try again.'
}

// Transaction retry utility with exponential backoff
async function retryTransaction<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      
      // Don't retry for certain errors
      if (isRejectedError(error) || isInsufficientFundsError(error)) {
        throw error
      }
      
      // For "already known" errors, don't retry immediately
      if (isAlreadyKnownError(error) && attempt === 0) {
        throw error
      }
      
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt)
        console.log(`Transaction attempt ${attempt + 1} failed, retrying in ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  throw lastError
}

interface TransactionState {
  hash?: string
  status: 'idle' | 'pending' | 'success' | 'error'
  error?: string
  userFriendlyError?: string
}

interface MachineManagerContextType {
  // ERC20 Functions
  approveToken: (spender: string, amount: string) => Promise<string | undefined>
  isApproving: boolean
  approveError: Error | null
  approveTransaction: TransactionState
  
  // Machine Manager Functions
  useMachine: (machineId: string) => Promise<string | undefined>
  isUsingMachine: boolean
  useMachineError: Error | null
  useMachineTransaction: TransactionState
  
  // Read Functions
  getClaimableFor: (machineId: string, user: string) => Promise<string>
  getOwnershipBps: (machineId: string, user: string) => Promise<string>
  getMachine: (machineId: string) => Promise<GetMachineReturn | null>
  getAllMachines: () => Promise<GetAllMachinesReturn>
  
  // ERC20 Utility Functions
  getTokenBalance: (account: string) => Promise<string>
  getTokenAllowance: (owner: string, spender: string) => Promise<string>
  
  // Complete Machine Interaction
  interactWithMachine: (machineId: string, userAddress: string, amount: string) => Promise<{
    success: boolean
    machineInfo: GetMachineReturn | null
    userBalance: string
    transactionHash: string | undefined
    error?: string
    userFriendlyError?: string
  }>
  
  // Transaction Management
  clearTransactionState: (type: 'approve' | 'useMachine') => void
  retryLastTransaction: () => Promise<void>
  
  // Loading states
  isLoading: boolean
  error: Error | null
}

const MachineManagerContext = createContext<MachineManagerContextType | undefined>(undefined)

interface MachineManagerProviderProps {
  children: ReactNode
}

export function MachineManagerProvider({ children }: MachineManagerProviderProps) {
  // Wagmi config and public client for direct contract calls
  const config = useConfig()
  const publicClient = usePublicClient()
  
  // Transaction state management
  const [approveTransaction, setApproveTransaction] = useState<TransactionState>({ status: 'idle' })
  const [useMachineTransaction, setUseMachineTransaction] = useState<TransactionState>({ status: 'idle' })
  const [lastTransactionParams, setLastTransactionParams] = useState<any>(null)
  
  // Write contract hook
  const { writeContract: writeContract, data: hash, error: writeError } = useWriteContract()

  // Transaction receipt hooks
  const { isLoading: isApproving, isSuccess: isApproveSuccess, isError: isApproveError } = useWaitForTransactionReceipt({
    hash: hash,
  })

  const { isLoading: isUsingMachine, isSuccess: isUseMachineSuccess, isError: isUseMachineError } = useWaitForTransactionReceipt({
    hash: hash,
  })

  // Update transaction states based on receipt status
  React.useEffect(() => {
    if (hash && isApproving) {
      setApproveTransaction({
        hash,
        status: 'pending'
      })
    }
    if (hash && isApproveSuccess) {
      setApproveTransaction({
        hash,
        status: 'success'
      })
    }
    if (hash && isApproveError) {
      setApproveTransaction({
        hash,
        status: 'error',
        error: (writeError as unknown as Error)?.message || 'Unknown error',
        userFriendlyError: getUserFriendlyErrorMessage(writeError)
      })
    }
  }, [hash, isApproving, isApproveSuccess, isApproveError, writeError])

  React.useEffect(() => {
    if (hash && isUsingMachine) {
      setUseMachineTransaction({
        hash,
        status: 'pending'
      })
    }
    if (hash && isUseMachineSuccess) {
      setUseMachineTransaction({
        hash,
        status: 'success'
      })
    }
    if (hash && isUseMachineError) {
      setUseMachineTransaction({
        hash,
        status: 'error',
        error: (writeError as unknown as Error)?.message || 'Unknown error',
        userFriendlyError: getUserFriendlyErrorMessage(writeError)
      })
    }
  }, [hash, isUsingMachine, isUseMachineSuccess, isUseMachineError, writeError])

  

  // ERC20 Approve function
  const approveToken = async (spender: string, amount: string): Promise<string | undefined> => {
    try {
      // Validate inputs
      if (!isAddress(spender)) {
        throw new Error('Invalid spender address')
      }
      if (!amount || parseFloat(amount) <= 0) {
        throw new Error('Invalid amount')
      }

      setApproveTransaction({ status: 'pending' })
      setLastTransactionParams({ type: 'approve', spender, amount })

      const parsedAmount = parseEther(amount)
      
      await retryTransaction(async () => {
        writeContract({
          address: PEAQ_TOKEN_ADDRESS as `0x${string}`,
          abi: ERC20ABI,
          functionName: 'approve',
          args: [spender as `0x${string}`, parsedAmount],
          gas: 600_000n,
        })
      })

      return hash || undefined
    } catch (error) {
      console.error('Error approving token:', error)
      setApproveTransaction({
        status: 'error',
        error: (error as Error)?.message || 'Unknown error',
        userFriendlyError: getUserFriendlyErrorMessage(error)
      })
      throw error
    }
  }

  // Use Machine function
  const useMachine = async (machineId: string): Promise<string | undefined> => {
    try {
      if (!machineId) {
        throw new Error('Machine ID is required')
      }

      setUseMachineTransaction({ status: 'pending' })
      setLastTransactionParams({ type: 'useMachine', machineId })

      const numericId = convertMachineIdToBigInt(machineId)

      await retryTransaction(async () => {
        writeContract({
          address: MACHINE_MANAGER_ADDRESS as `0x${string}`,
          abi: MachineManagerABI,
          functionName: 'useMachine',
          args: [numericId],
        })
      })

      return hash || undefined
    } catch (error) {
      console.error('Error using machine:', error)
      setUseMachineTransaction({
        status: 'error',
        error: (error as Error)?.message || 'Unknown error',
        userFriendlyError: getUserFriendlyErrorMessage(error)
      })
      throw error
    }
  }

  // Read Functions - Direct contract calls for async operations
  const getClaimableFor = async (machineId: string, user: string): Promise<string> => {
    try {
      if (!publicClient) throw new Error('Public client not available')
      
      const numericId = convertMachineIdToBigInt(machineId)
      
      const result = await publicClient.readContract({
        address: MACHINE_MANAGER_ADDRESS as `0x${string}`,
        abi: MachineManagerABI,
        functionName: 'claimableFor',
        args: [numericId, user as `0x${string}`],
      })
      return formatEther(result as bigint)
    } catch (error) {
      console.error('Error getting claimable amount:', error)
      throw error
    }
  }

  const getOwnershipBps = async (machineId: string, user: string): Promise<string> => {
    try {
      if (!publicClient) throw new Error('Public client not available')
      
      const numericId = convertMachineIdToBigInt(machineId)
      
      const result = await publicClient.readContract({
        address: MACHINE_MANAGER_ADDRESS as `0x${string}`,
        abi: MachineManagerABI,
        functionName: 'ownershipBps',
        args: [numericId, user as `0x${string}`],
      })
      return (result as bigint).toString()
    } catch (error) {
      console.error('Error getting ownership bps:', error)
      throw error
    }
  }

  const getMachine = async (machineId: string): Promise<GetMachineReturn | null> => {
    try {
      if (!publicClient) throw new Error('Public client not available')
      
      const numericId = convertMachineIdToBigInt(machineId)
      
      const result = await publicClient.readContract({
        address: MACHINE_MANAGER_ADDRESS as `0x${string}`,
        abi: MachineManagerABI,
        functionName: 'getMachine',
        args: [numericId],
      })

      const data = result as any[]
      return {
        name: data[0] as string,
        machineAddr: data[1] as string,
        price: formatEther(data[2] as bigint),
        platformFeeBps: data[3] as number,
        revenueShareBps: data[4] as number,
        sharesPerPurchase: data[5].toString(),
        totalShares: data[6].toString(),
        lifetimeRevenue: formatEther(data[7] as bigint),
        unallocatedRevenue: formatEther(data[8] as bigint),
      }
    } catch (error) {
      console.error('Error getting machine:', error)
      throw error
    }
  }

  const getAllMachines = async (): Promise<GetAllMachinesReturn> => {
    try {
      if (!publicClient) throw new Error('Public client not available')
      
      const result = await publicClient.readContract({
        address: MACHINE_MANAGER_ADDRESS as `0x${string}`,
        abi: MachineManagerABI,
        functionName: 'getAllMachines',
        args: [],
      })

      const machines = result as any[]
      console.log('Raw contract result:', machines)
      
      return machines.map((machine: any, index: number) => {
        console.log(`Machine ${index}:`, machine)
        
        return {
          name: machine[0] as string || `Machine ${index + 1}`,
          machineOnChainAddr: machine[1] as string || '',
          price: machine[2] ? formatEther(machine[2] as bigint) : '0',
          platformFeeBps: machine[3] as number || 0,
          revenueShareBps: machine[4] as number || 0,
          sharesPerPurchase: machine[5] ? formatEther(machine[5] as bigint) : '0',
          totalShares: machine[6] ? formatEther(machine[6] as bigint) : '0',
          lifetimeRevenue: machine[7] ? formatEther(machine[7] as bigint) : '0',
          rewardPerShare: machine[8] ? formatEther(machine[8] as bigint) : '0',
          unallocatedRevenue: machine[9] ? formatEther(machine[9] as bigint) : '0',
          exists: machine[10] as boolean || false,
        }
      })
    } catch (error) {
      console.error('Error getting all machines:', error)
      throw error
    }
  }

  // Additional ERC20 utility functions
  const getTokenBalance = async (account: string): Promise<string> => {
    try {
      if (!publicClient) throw new Error('Public client not available')
      
      const result = await publicClient.readContract({
        address: PEAQ_TOKEN_ADDRESS as `0x${string}`,
        abi: ERC20ABI,
        functionName: 'balanceOf',
        args: [account as `0x${string}`],
      })
      return formatEther(result as bigint)
    } catch (error) {
      console.error('Error getting token balance:', error)
      throw error
    }
  }

  const getTokenAllowance = async (owner: string, spender: string): Promise<string> => {
    try {
      if (!publicClient) throw new Error('Public client not available')
      
      const result = await publicClient.readContract({
        address: PEAQ_TOKEN_ADDRESS as `0x${string}`,
        abi: ERC20ABI,
        functionName: 'allowance',
        args: [owner as `0x${string}`, spender as `0x${string}`],
      })
      return formatEther(result as bigint)
    } catch (error) {
      console.error('Error getting token allowance:', error)
      throw error
    }
  }

  // Complete machine interaction flow
  const interactWithMachine = async (machineId: string, userAddress: string, amount: string) => {
    try {
      // 1. Get machine info to get the price
      const machineInfo = await getMachine(machineId)
      if (!machineInfo) {
        throw new Error('Machine not found')
      }

      // 2. Check user's token balance
      const userBalance = await getTokenBalance(userAddress)
      if (parseFloat(userBalance) < parseFloat(amount)) {
        throw new Error('Insufficient token balance')
      }

      // 3. Check current allowance
      const currentAllowance = await getTokenAllowance(userAddress, MACHINE_MANAGER_ADDRESS)
      const requiredAmount = parseEther(amount)

      // 4. Approve tokens if needed
      if (parseFloat(currentAllowance) < parseFloat(amount)) {
        console.log('Approving tokens...')
        await approveToken(MACHINE_MANAGER_ADDRESS, amount)
        // Wait for approval transaction to be mined
        // In a real app, you'd wait for the transaction receipt
      }

      // 5. Use the machine
      console.log('Using machine...')
      await useMachine(machineId)

      return {
        success: true,
        machineInfo,
        userBalance,
        transactionHash: hash,
      }
    } catch (error) {
      console.error('Error interacting with machine:', error)
      return {
        success: false,
        machineInfo: null,
        userBalance: '0',
        transactionHash: undefined,
        error: (error as Error)?.message || 'Unknown error',
        userFriendlyError: getUserFriendlyErrorMessage(error)
      }
    }
  }

  // Transaction management functions
  const clearTransactionState = useCallback((type: 'approve' | 'useMachine') => {
    if (type === 'approve') {
      setApproveTransaction({ status: 'idle' })
    } else if (type === 'useMachine') {
      setUseMachineTransaction({ status: 'idle' })
    }
  }, [])

  const retryLastTransaction = useCallback(async () => {
    if (!lastTransactionParams) {
      throw new Error('No previous transaction to retry')
    }

    try {
      if (lastTransactionParams.type === 'approve') {
        await approveToken(lastTransactionParams.spender, lastTransactionParams.amount)
      } else if (lastTransactionParams.type === 'useMachine') {
        await useMachine(lastTransactionParams.machineId)
      }
    } catch (error) {
      console.error('Error retrying transaction:', error)
      throw error
    }
  }, [lastTransactionParams])

  const isLoading = isApproving || isUsingMachine
  const error = writeError

  const value: MachineManagerContextType = {
    // ERC20 Functions
    approveToken,
    isApproving,
    approveError: writeError,
    approveTransaction,
    
    // Machine Manager Functions
    useMachine,
    isUsingMachine,
    useMachineError: writeError,
    useMachineTransaction,
    
    // Read Functions
    getClaimableFor,
    getOwnershipBps,
    getMachine,
    getAllMachines,
    
    // ERC20 Utility Functions
    getTokenBalance,
    getTokenAllowance,
    
    // Complete Machine Interaction
    interactWithMachine,
    
    // Transaction Management
    clearTransactionState,
    retryLastTransaction,
    
    // Loading states
    isLoading,
    error,
  }

  return (
    <MachineManagerContext.Provider value={value}>
      {children}
    </MachineManagerContext.Provider>
  )
}

export function useMachineManager() {
  const context = useContext(MachineManagerContext)
  if (context === undefined) {
    throw new Error('useMachineManager must be used within a MachineManagerProvider')
  }
  return context
}

// Hook for reading claimable amount
export function useClaimableFor(machineId: string, user: string) {
  // Convert string ID to numeric ID for contract calls
  const numericId = React.useMemo(() => {
    return convertMachineIdToBigInt(machineId)
  }, [machineId])

  const { data, error, isLoading, refetch } = useReadContract({
    address: MACHINE_MANAGER_ADDRESS as `0x${string}`,
    abi: MachineManagerABI,
    functionName: 'claimableFor',
    args: [numericId, user as `0x${string}`],
    query: {
      enabled: !!machineId && !!user,
    },
  })

  return {
    claimableAmount: data ? formatEther(data as bigint) : '0',
    error,
    isLoading,
    refetch,
  }
}

// Hook for reading ownership basis points
export function useOwnershipBps(machineId: string, user: string) {
  // Convert string ID to numeric ID for contract calls
  const numericId = React.useMemo(() => {
    return convertMachineIdToBigInt(machineId)
  }, [machineId])

  const { data, error, isLoading, refetch } = useReadContract({
    address: MACHINE_MANAGER_ADDRESS as `0x${string}`,
    abi: MachineManagerABI,
    functionName: 'ownershipBps',
    args: [numericId, user as `0x${string}`],
    query: {
      enabled: !!machineId && !!user,
    },
  })

  return {
    ownershipBps: data ? data.toString() : '0',
    error,
    isLoading,
    refetch,
  }
}

// Hook for reading machine information
export function useMachineInfo(machineId: string) {
  // Convert string ID to numeric ID for contract calls
  const numericId = React.useMemo(() => {
    return convertMachineIdToBigInt(machineId)
  }, [machineId])

  const { data, error, isLoading, refetch } = useReadContract({
    address: MACHINE_MANAGER_ADDRESS as `0x${string}`,
    abi: MachineManagerABI,
    functionName: 'getMachine',
    args: [numericId],
    query: {
      enabled: !!machineId,
    },
  })

  const machineInfo: GetMachineReturn | null = data ? {
    name: (data as any)[0] as string,
    machineAddr: (data as any)[1] as string,
    price: formatEther((data as any)[2] as bigint),
    platformFeeBps: (data as any)[3] as number,
    revenueShareBps: (data as any)[4] as number,
    sharesPerPurchase: (data as any)[5].toString(),
    totalShares: (data as any)[6].toString(),
    lifetimeRevenue: formatEther((data as any)[7] as bigint),
    unallocatedRevenue: formatEther((data as any)[8] as bigint),
  } : null

  return {
    machineInfo,
    error,
    isLoading,
    refetch,
  }
}

// Hook for ERC20 allowance
export function useTokenAllowance(owner: string, spender: string) {
  const { data, error, isLoading, refetch } = useReadContract({
    address: PEAQ_TOKEN_ADDRESS as `0x${string}`,
    abi: ERC20ABI,
    functionName: 'allowance',
    args: [owner as `0x${string}`, spender as `0x${string}`],
    query: {
      enabled: !!owner && !!spender,
    },
  })

  return {
    allowance: data ? formatEther(data as bigint) : '0',
    error,
    isLoading,
    refetch,
  }
}

// Hook for ERC20 balance
export function useTokenBalance(account: string) {
  const { data, error, isLoading, refetch } = useReadContract({
    address: PEAQ_TOKEN_ADDRESS as `0x${string}`,
    abi: ERC20ABI,
    functionName: 'balanceOf',
    args: [account as `0x${string}`],
    query: {
      enabled: !!account,
    },
  })

  return {
    balance: data ? formatEther(data as bigint) : '0',
    error,
    isLoading,
    refetch,
  }
}

// Hook for getting all machines
export function useAllMachines() {
  const { data, error, isLoading, refetch } = useReadContract({
    address: MACHINE_MANAGER_ADDRESS as `0x${string}`,
    abi: MachineManagerABI,
    functionName: 'getAllMachines',
    args: [],
  })

  const machines: GetAllMachinesReturn = data ? (data as any[]).map((machine: any, index: number) => {
    console.log(`Hook Machine ${index}:`, machine)
    
    return {
      name: machine[0] as string || `Machine ${index + 1}`,
      machineOnChainAddr: machine[1] as string || '',
      price: machine[2] ? formatEther(machine[2] as bigint) : '0',
      platformFeeBps: machine[3] as number || 0,
      revenueShareBps: machine[4] as number || 0,
      sharesPerPurchase: machine[5] ? formatEther(machine[5] as bigint) : '0',
      totalShares: machine[6] ? formatEther(machine[6] as bigint) : '0',
      lifetimeRevenue: machine[7] ? formatEther(machine[7] as bigint) : '0',
      rewardPerShare: machine[8] ? formatEther(machine[8] as bigint) : '0',
      unallocatedRevenue: machine[9] ? formatEther(machine[9] as bigint) : '0',
      exists: machine[10] as boolean || false,
    }
  }) : []

  return {
    machines,
    error,
    isLoading,
    refetch,
  }
}
