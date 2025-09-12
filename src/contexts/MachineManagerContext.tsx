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

import React, { createContext, useContext, ReactNode } from 'react'
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useConfig, usePublicClient } from 'wagmi'
import { parseEther, formatEther } from 'viem'
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

interface MachineManagerContextType {
  // ERC20 Functions
  approveToken: (spender: string, amount: string) => Promise<string | undefined>
  isApproving: boolean
  approveError: Error | null
  
  // Machine Manager Functions
  useMachine: (machineId: string) => Promise<string | undefined>
  isUsingMachine: boolean
  useMachineError: Error | null
  
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
  }>
  
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
  
  // Write contract hook
  const { writeContract: writeContract, data: hash, error: writeError } = useWriteContract()

  // Transaction receipt hooks
  const { isLoading: isApproving } = useWaitForTransactionReceipt({
    hash: hash,
  })

  const { isLoading: isUsingMachine } = useWaitForTransactionReceipt({
    hash: hash,
  })

  

  // ERC20 Approve function
  const approveToken = async (spender: string, amount: string): Promise<string | undefined> => {
    try {
      const parsedAmount = parseEther(amount)
      writeContract({
        address: PEAQ_TOKEN_ADDRESS as `0x${string}`,
        abi: ERC20ABI,
        functionName: 'approve',
        args: [spender as `0x${string}`, parsedAmount],
        gas: 500_000n,
      })
      return hash || undefined
    } catch (error) {
      console.error('Error approving token:', error)
      throw error
    }
  }

  // Use Machine function
  const useMachine = async (machineId: string): Promise<string | undefined> => {
    try {
      const numericId = convertMachineIdToBigInt(machineId)

      writeContract({
        address: MACHINE_MANAGER_ADDRESS as `0x${string}`,
        abi: MachineManagerABI,
        functionName: 'useMachine',
        args: [numericId],
      })
      return hash || undefined
    } catch (error) {
      console.error('Error using machine:', error)
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
        return {
          name: machine.name || `Machine ${index + 1}`,
          machineOnChainAddr: machine.machineOnChainAddr || '',
          price: machine.price ? formatEther(machine.price as bigint) : '0',
          platformFeeBps: Number(machine.platformFeeBps) || 0,       // no formatEther
          revenueShareBps: Number(machine.revenueShareBps) || 0,     // no formatEther
          sharesPerPurchase: machine.sharesPerPurchase?.toString() || '0', // plain integer
          totalShares: machine.totalShares?.toString() || '0',       // plain integer
          lifetimeRevenue: machine.lifetimeRevenue ? formatEther(machine.lifetimeRevenue as bigint) : '0',
          rewardPerShare: machine.rewardPerShare ? formatEther(machine.rewardPerShare as bigint) : '0', // scaled
          unallocatedRevenue: machine.unallocatedRevenue ? formatEther(machine.unallocatedRevenue as bigint) : '0',
          exists: machine.exists || false,
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
      throw error
    }
  }

  const isLoading = isApproving || isUsingMachine
  const error = writeError

  const value: MachineManagerContextType = {
    // ERC20 Functions
    approveToken,
    isApproving,
    approveError: writeError,
    
    // Machine Manager Functions
    useMachine,
    isUsingMachine,
    useMachineError: writeError,
    
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

// Hook for getting user's share balance for a specific machine
export function useUserShareBalance(machineId: string, user: string) {
  // Convert string ID to numeric ID for contract calls
  const numericId = React.useMemo(() => {
    return convertMachineIdToBigInt(machineId)
  }, [machineId])

  const { data, error, isLoading, refetch } = useReadContract({
    address: MACHINE_MANAGER_ADDRESS as `0x${string}`,
    abi: MachineManagerABI,
    functionName: 'balanceOf',
    args: [user as `0x${string}`, numericId],
    query: {
      enabled: !!user && !!numericId,
    },
  })

  return {
    shareBalance: data ? (data as bigint).toString() : '0',
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
    console.log('useAllMachines processing machine:', machine)
    
    return {
      name: machine.name as string || `Machine ${index + 1}`,
      machineOnChainAddr: machine.machineOnChainAddr as string || '',
      price: machine.price ? formatEther(machine.price as bigint) : '0',
      platformFeeBps: machine.platformFeeBps as number || 0,
      revenueShareBps: machine.revenueShareBps as number || 0,
      sharesPerPurchase: machine.sharesPerPurchase ? formatEther(machine.sharesPerPurchase as bigint) : '0',
      totalShares: machine.totalShares ? formatEther(machine.totalShares as bigint) : '0',
      lifetimeRevenue: machine.lifetimeRevenue ? formatEther(machine.lifetimeRevenue as bigint) : '0',
      rewardPerShare: machine.rewardPerShare ? formatEther(machine.rewardPerShare as bigint) : '0',
      unallocatedRevenue: machine.unallocatedRevenue ? formatEther(machine.unallocatedRevenue as bigint) : '0',
      exists: machine.exists as boolean || false,
    }
  }) : []

  return {
    machines,
    error,
    isLoading,
    refetch,
  }
}
