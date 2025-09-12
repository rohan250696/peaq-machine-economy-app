export interface Machine {
  id: string
  name: string
  type: 'RoboCafe' | 'Humanoid'
  image: string
  address: string
  revenue: number
  totalRevenue: number
  isActive: boolean
  location: {
    name: string
    lat: number
    lng: number
  }
  // Contract data fields (optional for backward compatibility)
  price?: number
  platformFeeBps?: number
  revenueShareBps?: number
  sharesPerPurchase?: number
  totalShares?: number
  unallocatedRevenue?: number
  ownershipBps?: number
}

export interface User {
  id: string
  walletAddress: string
  email?: string
  name?: string
  avatar?: string
  isAuthenticated: boolean
}

export interface Ownership {
  machineId: string
  percentage: number
  tokens: number
  totalTokens: number
  earnings: number
  lastEarning: string
}

export interface Transaction {
  id: string
  machineId: string
  amount: number
  type: 'purchase' | 'earning'
  status: 'pending' | 'completed' | 'failed'
  hash?: string
  timestamp: string
}

export interface PaymentFlowStep {
  id: string
  title: string
  description: string
  status: 'pending' | 'active' | 'completed' | 'error'
}

export type RootStackParamList = {
  Splash: undefined
  Onboarding: undefined
  MachineSelection: undefined
  Action: { machine: Machine }
  PaymentFlow: { machine: Machine; action: string }
  Ownership: { machine: Machine; ownership: Ownership }
  Dashboard: undefined
}
