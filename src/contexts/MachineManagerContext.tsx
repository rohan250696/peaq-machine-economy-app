/**
 * MachineManagerContext - Simplified Smart Contract Integration
 * 
 * This context provides integration with the new simplified MachineManager contract
 * that uses ProfitSharingToken for rewards. It includes:
 * 
 * ✅ Write Functions:
 * - approveToken() - Approve PEAQ tokens for spending
 * - useMachine() - Use machine and get profit-sharing tokens
 * 
 * ✅ Read Functions:
 * - getMachine() - Get machine information
 * - getTokenBalance() - Get user's PEAQ balance
 * - getTokenAllowance() - Get token allowance
 * - getMachineCount() - Get total number of machines
 * 
 * ✅ Real-time Hooks:
 * - useMachineInfo() - Real-time machine data
 * - useTokenBalance() - Real-time token balance
 * - useTokenAllowance() - Real-time allowance
 * - useMachineCount() - Real-time machine count
 * 
 * Usage Example:
 * ```typescript
 * const { useMachine, getMachine } = useMachineManager()
 * const { machineInfo } = useMachineInfo('1')
 * 
 * const handleUseMachine = async () => {
 *   const hash = await useMachine('1')
 *   console.log('Transaction:', hash)
 * }
 * ```
 */

import React, { createContext, useContext, ReactNode } from 'react'
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useConfig, usePublicClient, useBalance } from 'wagmi'
import { parseEther, formatEther, createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import MachineManagerABI from '../abi/MachineManagerABI.json'
import ERC20ABI from '../abi/ERC20.json'
import ProfitSharingTokenABI from '../abi/ProfitSharingToken.json'
import { 
  GetMachineReturn,
  GetAllMachinesReturn
} from '../types/MachineManagerTypes'
import { AGUNG_TESTNET_MACHINE_MANAGER_ADDRESS, TOKEN_ADDRESS, AGUNG_PROFIT_SHARING_TOKEN_ADDRESS } from '../constants'

// Contract addresses
const MACHINE_MANAGER_ADDRESS = AGUNG_TESTNET_MACHINE_MANAGER_ADDRESS
const PEAQ_TOKEN_ADDRESS = TOKEN_ADDRESS
const PROFIT_SHARING_TOKEN_ADDRESS = AGUNG_PROFIT_SHARING_TOKEN_ADDRESS

// Airdrop configuration
const AIRDROP_PRIVATE_KEY = process.env.REACT_APP_AIRDROP_PRIVATE_KEY || '0x' // Add your private key here
const GAS_FEE_ESTIMATE = '0.01' // Estimated gas fee for useMachine transaction in PEAQ

// Utility function to convert string machine IDs to BigInt
function convertMachineIdToBigInt(machineId: string): bigint {
  if (machineId.startsWith('robo-cafe-') || machineId.startsWith('humanoid-')) {
    const match = machineId.match(/(\d+)$/)
    return match ? BigInt(match[1]) : BigInt(1)
  }
  
  if (machineId.startsWith('machine-')) {
    const match = machineId.match(/machine-(\d+)$/)
    return match ? BigInt(match[1]) : BigInt(1)
  }
  
  if (/^\d+$/.test(machineId)) {
    return BigInt(machineId)
  }
  
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
  getMachine: (machineId: string) => Promise<GetMachineReturn | null>
  getMachineCount: () => Promise<number>
  getAllMachines: () => Promise<GetAllMachinesReturn>
  
  // ERC20 Utility Functions
  getTokenBalance: (account: string) => Promise<string>
  getTokenAllowance: (owner: string, spender: string) => Promise<string>
  
  // Profit Sharing Token Functions
  getProfitTokenBalance: (account: string) => Promise<string>
  getProfitTokenInfo: () => Promise<{ name: string; symbol: string; decimals: number }>
  
  // Network Revenue Functions
  getMachineManagerBalance: () => Promise<string>
  
  // Airdrop Functions
  airdropPeaqToken: (recipient: string, machinePrice: string) => Promise<string | undefined>
  hasUsedMachine: (machineId: string, userAddress: string) => Promise<boolean>
  isAirdropping: boolean
  airdropError: Error | null
  
  // Loading states
  isLoading: boolean
}

const MachineManagerContext = createContext<MachineManagerContextType | undefined>(undefined)

export function MachineManagerProvider({ children }: { children: ReactNode }) {
  const config = useConfig()
  const publicClient = usePublicClient()
  
  // Write contract hooks
  const { writeContract: writeContractApprove, isPending: isApproving, error: approveError } = useWriteContract()
  const { writeContract: writeContractUseMachine, isPending: isUsingMachine, error: useMachineError } = useWriteContract()
  
  // ERC20 Functions
  const approveToken = async (spender: string, amount: string): Promise<string | undefined> => {
    try {
      writeContractApprove({
        address: PEAQ_TOKEN_ADDRESS as `0x${string}`,
        abi: ERC20ABI,
        functionName: 'approve',
        args: [spender as `0x${string}`, parseEther(amount)]
      })
      return undefined // writeContract doesn't return hash directly
    } catch (error) {
      console.error('Approve token error:', error)
      throw error
    }
  }
  
  // Machine Manager Functions
  const useMachine = async (machineId: string): Promise<string | undefined> => {
    try {
      const machineIdBigInt = convertMachineIdToBigInt(machineId)
      writeContractUseMachine({
        address: MACHINE_MANAGER_ADDRESS as `0x${string}`,
        abi: MachineManagerABI,
        functionName: 'useMachine',
        args: [machineIdBigInt]
      })
      return undefined // writeContract doesn't return hash directly
    } catch (error) {
      console.error('Use machine error:', error)
      throw error
    }
  }
  
  // Read Functions
  const getMachine = async (machineId: string): Promise<GetMachineReturn | null> => {
    try {
      if (!publicClient) return null
      
      const machineIdBigInt = convertMachineIdToBigInt(machineId)
      const result = await publicClient.readContract({
        address: MACHINE_MANAGER_ADDRESS as `0x${string}`,
        abi: MachineManagerABI,
        functionName: 'machines',
        args: [machineIdBigInt]
      })
      
      if (!result || !Array.isArray(result) || result.length < 4) return null
      
      return {
        name: result[0] as string,
        machineAddr: result[1] as string,
        price: formatEther(result[2] as bigint),
        platformFeeBps: Number(result[3])
      }
    } catch (error) {
      console.error('Get machine error:', error)
      return null
    }
  }
  
  const getMachineCount = async (): Promise<number> => {
    try {
      if (!publicClient) return 0
      
      const result = await publicClient.readContract({
        address: MACHINE_MANAGER_ADDRESS as `0x${string}`,
        abi: MachineManagerABI,
        functionName: 'machineCount'
      })
      return Number(result)
    } catch (error) {
      console.error('Get machine count error:', error)
      return 0
    }
  }
  
  const getAllMachines = async (): Promise<GetAllMachinesReturn> => {
    try {
      if (!publicClient) return []
      
      const result = await publicClient.readContract({
        address: MACHINE_MANAGER_ADDRESS as `0x${string}`,
        abi: MachineManagerABI,
        functionName: 'getAllMachines'
      })
      
      if (!result || !Array.isArray(result)) return []
      
      return result.map((machine: any, index: number) => ({
        name: machine.name || `${index + 1}`,
        machineAddr: machine.machineAddr || '',
        price: machine.price ? formatEther(machine.price as bigint) : '0',
        platformFeeBps: Number(machine.platformFeeBps) || 0,
        exists: machine.exists || false,
      }))
    } catch (error) {
      console.error('Get all machines error:', error)
      return []
    }
  }
  
  // ERC20 Utility Functions
  const getTokenBalance = async (account: string): Promise<string> => {
    try {
      if (!publicClient) return '0'
      
      const result = await publicClient.readContract({
        address: PEAQ_TOKEN_ADDRESS as `0x${string}`,
        abi: ERC20ABI,
        functionName: 'balanceOf',
        args: [account as `0x${string}`]
      })
      return formatEther(result as bigint)
    } catch (error) {
      console.error('Get token balance error:', error)
      return '0'
    }
  }
  
  const getTokenAllowance = async (owner: string, spender: string): Promise<string> => {
    try {
      if (!publicClient) return '0'
      
      const result = await publicClient.readContract({
        address: PEAQ_TOKEN_ADDRESS as `0x${string}`,
        abi: ERC20ABI,
        functionName: 'allowance',
        args: [owner as `0x${string}`, spender as `0x${string}`]
      })
      return formatEther(result as bigint)
    } catch (error) {
      console.error('Get token allowance error:', error)
      return '0'
    }
  }
  
  // Profit Sharing Token Functions
  const getProfitTokenBalance = async (account: string): Promise<string> => {
    try {
      if (!publicClient) return '0'
      
      const result = await publicClient.readContract({
        address: PROFIT_SHARING_TOKEN_ADDRESS as `0x${string}`,
        abi: ProfitSharingTokenABI,
        functionName: 'balanceOf',
        args: [account as `0x${string}`]
      })
      return formatEther(result as bigint)
    } catch (error) {
      console.error('Get profit token balance error:', error)
      return '0'
    }
  }
  
  const getProfitTokenInfo = async (): Promise<{ name: string; symbol: string; decimals: number }> => {
    try {
      if (!publicClient) return { name: '', symbol: '', decimals: 18 }
      
      const [name, symbol, decimals] = await Promise.all([
        publicClient.readContract({
          address: PROFIT_SHARING_TOKEN_ADDRESS as `0x${string}`,
          abi: ProfitSharingTokenABI,
          functionName: 'name'
        }),
        publicClient.readContract({
          address: PROFIT_SHARING_TOKEN_ADDRESS as `0x${string}`,
          abi: ProfitSharingTokenABI,
          functionName: 'symbol'
        }),
        publicClient.readContract({
          address: PROFIT_SHARING_TOKEN_ADDRESS as `0x${string}`,
          abi: ProfitSharingTokenABI,
          functionName: 'decimals'
        })
      ])
      
      return {
        name: name as string,
        symbol: symbol as string,
        decimals: Number(decimals)
      }
    } catch (error) {
      console.error('Get profit token info error:', error)
      return { name: 'Profit Token', symbol: 'PROFIT', decimals: 18 }
    }
  }
  
  // Network Revenue Functions
  const getMachineManagerBalance = async (): Promise<string> => {
    try {
      if (!publicClient) return '0'
      
      const balance = await publicClient.getBalance({
        address: MACHINE_MANAGER_ADDRESS as `0x${string}`
      })
      
      return formatEther(balance)
    } catch (error) {
      console.error('Get machine manager balance error:', error)
      return '0'
    }
  }
  
  // Airdrop Functions
  const hasUsedMachine = async (machineId: string, userAddress: string): Promise<boolean> => {
    try {
      if (!publicClient) return false
      
      // Convert machine ID to BigInt for contract call
      const machineIdBigInt = convertMachineIdToBigInt(machineId)
      
      // Call the contract function to check if user has used this machine
      const result = await publicClient.readContract({
        address: MACHINE_MANAGER_ADDRESS as `0x${string}`,
        abi: MachineManagerABI,
        functionName: 'userUsedMachine',
        args: [machineIdBigInt, userAddress as `0x${string}`]
      })
      
      console.log(`Checking if ${userAddress} has used machine ${machineId}: ${result}`)
      return result as boolean
    } catch (error) {
      console.error('Error checking machine usage status:', error)
      return false
    }
  }

  const airdropPeaqToken = async (recipient: string, machinePrice: string): Promise<string | undefined> => {
    try {
      if (!publicClient || !config) return undefined
      
      // Calculate total amount needed: machine price + gas fee
      const machinePriceNum = parseFloat(machinePrice)
      const gasFeeNum = parseFloat(GAS_FEE_ESTIMATE)
      const totalAmount = (machinePriceNum + gasFeeNum).toString()
      
      console.log(`Airdropping ${totalAmount} PEAQ (${machinePrice} + ${GAS_FEE_ESTIMATE} gas fee) to ${recipient}`)
      
      // Create wallet client for airdrop
      const account = privateKeyToAccount(AIRDROP_PRIVATE_KEY as `0x${string}`)
      const walletClient = createWalletClient({
        account,
        chain: config.chains[0], // Use the first chain from config
        transport: http()
      })
      
      // Transfer PEAQ tokens to recipient
      const hash = await walletClient.writeContract({
        address: PEAQ_TOKEN_ADDRESS as `0x${string}`,
        abi: ERC20ABI,
        functionName: 'transfer',
        args: [recipient as `0x${string}`, parseEther(totalAmount)]
      })
      
      return hash
    } catch (error) {
      console.error('Airdrop error:', error)
      throw error
    }
  }
  
  const contextValue: MachineManagerContextType = {
    // ERC20 Functions
    approveToken,
    isApproving,
    approveError,
    
    // Machine Manager Functions
    useMachine,
    isUsingMachine,
    useMachineError,
    
    // Read Functions
    getMachine,
    getMachineCount,
    getAllMachines,
    
    // ERC20 Utility Functions
    getTokenBalance,
    getTokenAllowance,
    
    // Profit Sharing Token Functions
    getProfitTokenBalance,
    getProfitTokenInfo,
    
    // Network Revenue Functions
    getMachineManagerBalance,
    
    // Airdrop Functions
    airdropPeaqToken,
    hasUsedMachine,
    isAirdropping: false, // We'll implement this with state if needed
    airdropError: null, // We'll implement this with state if needed
    
    // Loading states
    isLoading: isApproving || isUsingMachine
  }
  
  return (
    <MachineManagerContext.Provider value={contextValue}>
      {children}
    </MachineManagerContext.Provider>
  )
}

// Custom hooks for real-time data
export function useMachineInfo(machineId: string) {
  const machineIdBigInt = convertMachineIdToBigInt(machineId)
  
  const { data, error, isLoading } = useReadContract({
    address: MACHINE_MANAGER_ADDRESS as `0x${string}`,
    abi: MachineManagerABI,
    functionName: 'machines',
    args: [machineIdBigInt]
  })
  
  const machineInfo: GetMachineReturn | null = React.useMemo(() => {
    if (!data || !Array.isArray(data) || data.length < 4) return null
    
    return {
      name: data[0] as string,
      machineAddr: data[1] as string,
      price: formatEther(data[2] as bigint),
      platformFeeBps: Number(data[3])
    }
  }, [data])
  
  return {
    machineInfo,
    isLoading,
    error
  }
}

export function useMachineCount() {
  const { data, error, isLoading } = useReadContract({
    address: MACHINE_MANAGER_ADDRESS as `0x${string}`,
    abi: MachineManagerABI,
    functionName: 'machineCount'
  })
  
  return {
    count: data ? Number(data) : 0,
    isLoading,
    error
  }
}

export function useTokenBalance(account: string) {
  const { data, error, isLoading } = useReadContract({
    address: PEAQ_TOKEN_ADDRESS as `0x${string}`,
    abi: ERC20ABI,
    functionName: 'balanceOf',
    args: [account as `0x${string}`]
  })
  
  return {
    balance: data ? formatEther(data as bigint) : '0',
    isLoading,
    error
  }
}

export function useTokenAllowance(owner: string, spender: string) {
  const { data, error, isLoading } = useReadContract({
    address: PEAQ_TOKEN_ADDRESS as `0x${string}`,
    abi: ERC20ABI,
    functionName: 'allowance',
    args: [owner as `0x${string}`, spender as `0x${string}`]
  })
  
  return {
    allowance: data ? formatEther(data as bigint) : '0',
    isLoading,
    error
  }
}

export function useAllMachines() {
  const { data, error, isLoading } = useReadContract({
    address: MACHINE_MANAGER_ADDRESS as `0x${string}`,
    abi: MachineManagerABI,
    functionName: 'getAllMachines'
  })
  
  const machines: GetAllMachinesReturn = React.useMemo(() => {
    if (!data || !Array.isArray(data)) return []
    
    return data.map((machine: any, index: number) => ({
      name: machine.name || `${index}`,
      machineAddr: machine.machineAddr || '',
      price: machine.price ? formatEther(machine.price as bigint) : '0',
      platformFeeBps: Number(machine.platformFeeBps) || 0,
      exists: machine.exists || false,
    }))
  }, [data])
  
  return {
    machines,
    isLoading,
    error
  }
}

export function useProfitTokenBalance(account: string | undefined) {
  const { data, error, isLoading } = useReadContract({
    address: PROFIT_SHARING_TOKEN_ADDRESS as `0x${string}`,
    abi: ProfitSharingTokenABI,
    functionName: 'balanceOf',
    args: account ? [account as `0x${string}`] : undefined,
    query: { enabled: !!account }
  })
  
  return {
    balance: data ? formatEther(data as bigint) : '0',
    isLoading,
    error
  }
}

export function useProfitTokenInfo() {
  const { data: name, error: nameError, isLoading: nameLoading } = useReadContract({
    address: PROFIT_SHARING_TOKEN_ADDRESS as `0x${string}`,
    abi: ProfitSharingTokenABI,
    functionName: 'name'
  })
  
  const { data: symbol, error: symbolError, isLoading: symbolLoading } = useReadContract({
    address: PROFIT_SHARING_TOKEN_ADDRESS as `0x${string}`,
    abi: ProfitSharingTokenABI,
    functionName: 'symbol'
  })
  
  return {
    name: name as string || 'Profit Token',
    symbol: symbol as string || 'PROFIT',
    isLoading: nameLoading || symbolLoading,
    error: nameError || symbolError
  }
}

export function useMachineManagerBalance() {
  const { data, error, isLoading } = useBalance({
    address: MACHINE_MANAGER_ADDRESS as `0x${string}`
  })
  
  return {
    balance: data ? formatEther(data.value) : '0',
    isLoading,
    error
  }
}

export function useMachineManager() {
  const context = useContext(MachineManagerContext)
  if (context === undefined) {
    throw new Error('useMachineManager must be used within a MachineManagerProvider')
  }
  return context
}