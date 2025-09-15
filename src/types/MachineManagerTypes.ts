// MachineManager Contract Types
// Generated from MachineManagerABI.json
// Standalone types - no imports from app

export interface MachineInfo {
  name: string;
  machineAddr: string;  // Renamed from machineOnChainAddr
  price: string;
  platformFeeBps: number;
  exists: boolean;  // Added back from contract
  // Removed: revenueShareBps, sharesPerPurchase, totalShares, lifetimeRevenue, unallocatedRevenue, rewardPerShare
}

// Return type for getAllMachines function
export type GetAllMachinesReturn = MachineInfo[]

export interface MachineAddedEvent {
  machineId: string;
  name: string;
  price: string;
}

export interface MachineUpdatedEvent {
  machineId: string;
}

export interface MachineUsedEvent {
  machineId: string;
  buyer: string;
  price: string;
}

export interface SharesMintedEvent {
  machineId: string;
  to: string;
  amount: string;
}

export interface RewardsClaimedEvent {
  machineId: string;
  claimant: string;
  amount: string;
}

export interface UnallocatedAllocatedEvent {
  machineId: string;
  amount: string;
}

export interface PlatformWithdrawEvent {
  to: string;
  amount: string;
}

// Contract Function Parameters
export interface AddMachineParams {
  name: string;
  machineOnChainAddr: string;
  price: string;
  platformFeeBps: number;
  revenueShareBps: number;
  sharesPerPurchase: string;
}

export interface UpdateMachineParams {
  machineId: string;
  name: string;
  machineOnChainAddr: string;
  price: string;
  platformFeeBps: number;
  revenueShareBps: number;
  sharesPerPurchase: string;
}

export interface ClaimRewardsParams {
  machineIds: string[];
}

export interface UseMachineParams {
  machineId: string;
}

export interface AllocateUnallocatedRevenueParams {
  machineId: string;
}

export interface ClaimableForParams {
  machineId: string;
  user: string;
}

export interface OwnershipBpsParams {
  machineId: string;
  user: string;
}

export interface BalanceOfParams {
  account: string;
  id: string;
}

export interface BalanceOfBatchParams {
  accounts: string[];
  ids: string[];
}

export interface GetMachineParams {
  machineId: string;
}

export interface WithdrawPlatformParams {
  amount: string;
  to: string;
}

export interface RescueERC20Params {
  token: string;
  amount: string;
  to: string;
}

export interface SetApprovalForAllParams {
  operator: string;
  approved: boolean;
}

export interface SafeTransferFromParams {
  from: string;
  to: string;
  id: string;
  value: string;
  data: string;
}

export interface SafeBatchTransferFromParams {
  from: string;
  to: string;
  ids: string[];
  values: string[];
  data: string;
}

// Contract Function Return Types
export interface AddMachineReturn {
  machineId: string;
}

export interface GetMachineReturn {
  name: string;
  machineAddr: string;
  price: string;
  platformFeeBps: number;
}

export interface ClaimableForReturn {
  amount: string;
}

export interface OwnershipBpsReturn {
  bps: string;
}

export interface BalanceOfReturn {
  balance: string;
}

export interface BalanceOfBatchReturn {
  balances: string[];
}

export interface ExistsReturn {
  exists: boolean;
}

export interface IsApprovedForAllReturn {
  approved: boolean;
}

export interface NextMachineIdReturn {
  nextId: string;
}

export interface OwnerReturn {
  owner: string;
}

export interface PaymentTokenReturn {
  token: string;
}

export interface SupportsInterfaceReturn {
  supported: boolean;
}

export interface TotalSupplyReturn {
  totalSupply: string;
}

export interface UriReturn {
  uri: string;
}

// Contract Events
export interface ApprovalForAllEvent {
  account: string;
  operator: string;
  approved: boolean;
}

export interface TransferSingleEvent {
  operator: string;
  from: string;
  to: string;
  id: string;
  value: string;
}

export interface TransferBatchEvent {
  operator: string;
  from: string;
  to: string;
  ids: string[];
  values: string[];
}

export interface UriEvent {
  value: string;
  id: string;
}

export interface OwnershipTransferredEvent {
  previousOwner: string;
  newOwner: string;
}

// Contract Error Types
export interface ERC1155InsufficientBalanceError {
  sender: string;
  balance: string;
  needed: string;
  tokenId: string;
}

export interface ERC1155InvalidApproverError {
  approver: string;
}

export interface ERC1155InvalidArrayLengthError {
  idsLength: string;
  valuesLength: string;
}

export interface ERC1155InvalidOperatorError {
  operator: string;
}

export interface ERC1155InvalidReceiverError {
  receiver: string;
}

export interface ERC1155InvalidSenderError {
  sender: string;
}

export interface ERC1155MissingApprovalForAllError {
  operator: string;
  owner: string;
}

export interface OwnableInvalidOwnerError {
  owner: string;
}

export interface OwnableUnauthorizedAccountError {
  account: string;
}

export interface SafeERC20FailedOperationError {
  token: string;
}

// Contract State Types
export interface ContractState {
  nextMachineId: string;
  owner: string;
  paymentToken: string;
  totalSupply: string;
}

// Machine State Types
export interface MachineState {
  id: string;
  info: MachineInfo;
  totalShares: string;
  lifetimeRevenue: string;
  unallocatedRevenue: string;
  rewardPerShare: string;
  exists: boolean;
}

// User State Types
export interface UserMachineBalance {
  machineId: string;
  balance: string;
  claimable: string;
  ownershipBps: string;
}

export interface UserState {
  address: string;
  balances: UserMachineBalance[];
  totalClaimable: string;
  totalOwnership: string;
}

// Transaction Types
export interface TransactionReceipt {
  transactionHash: string;
  blockNumber: string;
  gasUsed: string;
  status: 'success' | 'failed';
  events: ContractEvent[];
}

export interface ContractEvent {
  event: string;
  args: Record<string, any>;
  transactionHash: string;
  blockNumber: string;
  logIndex: number;
}

// Contract Configuration Types
export interface ContractConfig {
  address: string;
  abi: any[];
  chainId: number;
  rpcUrl: string;
}

// Machine Manager Specific Types
export interface MachineManagerConfig extends ContractConfig {
  paymentTokenAddress: string;
  platformFeeBps: number;
  defaultRevenueShareBps: number;
  defaultSharesPerPurchase: string;
}

export interface MachineInteraction {
  machineId: string;
  action: 'use' | 'claim' | 'allocate';
  amount?: string;
  gasEstimate?: string;
  gasPrice?: string;
}

export interface MachineRevenue {
  machineId: string;
  lifetimeRevenue: string;
  unallocatedRevenue: string;
  totalShares: string;
  rewardPerShare: string;
  lastAllocation?: string;
}

export interface MachineOwnership {
  machineId: string;
  userShares: string;
  totalShares: string;
  ownershipPercentage: string;
  claimableRewards: string;
  lastClaim?: string;
}

// Utility Types
export type MachineId = string;
export type UserAddress = string;
export type TokenAmount = string;
export type Percentage = string; // in basis points (bps)
export type Timestamp = string;

// Event Filter Types
export interface MachineEventFilter {
  machineId?: string;
  user?: string;
  fromBlock?: string;
  toBlock?: string;
}

export interface MachineAddedEventFilter extends MachineEventFilter {
  name?: string;
  price?: string;
}

export interface MachineUsedEventFilter extends MachineEventFilter {
  buyer?: string;
  price?: string;
}

export interface RewardsClaimedEventFilter extends MachineEventFilter {
  claimant?: string;
  amount?: string;
}

// Contract Method Types
export type ContractMethod = 
  | 'addMachine'
  | 'updateMachine'
  | 'useMachine'
  | 'claimRewards'
  | 'allocateUnallocatedRevenue'
  | 'getMachine'
  | 'balanceOf'
  | 'balanceOfBatch'
  | 'claimableFor'
  | 'ownershipBps'
  | 'withdrawPlatform'
  | 'setApprovalForAll'
  | 'isApprovedForAll'
  | 'safeTransferFrom'
  | 'safeBatchTransferFrom'
  | 'owner'
  | 'paymentToken'
  | 'nextMachineId'
  | 'totalSupply'
  | 'exists'
  | 'supportsInterface'
  | 'uri';

// Contract Event Types
export type ContractEventType =
  | 'MachineAdded'
  | 'MachineUpdated'
  | 'MachineUsed'
  | 'SharesMinted'
  | 'RewardsClaimed'
  | 'UnallocatedAllocated'
  | 'PlatformWithdraw'
  | 'ApprovalForAll'
  | 'TransferSingle'
  | 'TransferBatch'
  | 'Uri'
  | 'OwnershipTransferred';

// Contract Error Types
export type ContractErrorType =
  | 'ERC1155InsufficientBalance'
  | 'ERC1155InvalidApprover'
  | 'ERC1155InvalidArrayLength'
  | 'ERC1155InvalidOperator'
  | 'ERC1155InvalidReceiver'
  | 'ERC1155InvalidSender'
  | 'ERC1155MissingApprovalForAll'
  | 'OwnableInvalidOwner'
  | 'OwnableUnauthorizedAccount'
  | 'SafeERC20FailedOperation';
