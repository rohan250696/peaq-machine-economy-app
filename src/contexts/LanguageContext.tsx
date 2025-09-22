import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'

// Language types
export type Language = 'en' | 'ko'

// Translation keys interface
export interface Translations {
  // Header
  'header.wallet': string
  'header.logout': string
  'header.copyAddress': string
  'header.copied': string
  'header.copyFailed': string
  'header.noWalletAddress': string
  
  // Splash
  'splash.title': string
  'splash.description': string
  
  // Onboarding
  'onboarding.welcome': string
  'onboarding.subtitle': string
  'onboarding.getStarted': string
  'onboarding.connecting': string
  'onboarding.loginFailed': string
  'onboarding.tryAgain': string
  'onboarding.openingLogin': string
  
  // Navigation
  'nav.dashboard': string
  'nav.machineSelection': string
  'nav.machines': string
  'nav.backToMachines': string
  
  // Dashboard
  'dashboard.title': string
  'dashboard.totalPftEarnings': string
  'dashboard.networkRevenue': string
  'dashboard.userPftEarnings': string
  'dashboard.noMachines': string
  'dashboard.loading': string
  'dashboard.subtitle': string
  'dashboard.pftEarningsPerMachine': string
  'dashboard.earningsBreakdown': string
  'dashboard.twitterUser': string
  'dashboard.peaqUser': string
  
  // Machine Selection
  'machines.title': string
  'machines.totalNetworkRevenue': string
  'machines.activeMachines': string
  'machines.profitSharingToken': string
  'machines.availableForPurchase': string
  'machines.selectMachine': string
  'machines.price': string
  'machines.type': string
  'machines.address': string
  'machines.active': string
  'machines.inactive': string
  'machines.hotSale': string
  'machines.coffeeCost': string
  'machines.interactionCost': string
  'machines.online': string
  'machines.availableMachines': string
  'machines.selectToEarn': string
  
  // Ownership
  'ownership.title': string
  'ownership.congratulations': string
  'ownership.successMessage': string
  'ownership.profitSharingToken': string
  'ownership.pricePaid': string
  'ownership.platformFee': string
  'ownership.backToMachines': string
  'ownership.machine': string
  'ownership.transactionComplete': string
  
  // Payment
  'payment.title': string
  'payment.processing': string
  'payment.success': string
  'payment.error': string
  'payment.goBack': string
  'payment.transactionHash': string
  'payment.viewOnExplorer': string
  'payment.airdropTransaction': string
  'payment.machineTransaction': string
  'payment.airdropping': string
  'payment.getting': string
  'payment.gasFee': string
  'payment.usingMachine': string
  'payment.callingContract': string
  'payment.gotYour': string
  'payment.completedSuccessfully': string
  'payment.checkingEligibility': string
  'payment.viewOwnership': string
  'payment.transactionInProgress': string
  'payment.viewTransactions': string
  'payment.cancelled': string
  'payment.cancelledMessage': string
  'payment.tryAgain': string
  'payment.walletRequired': string
  'payment.connectWallet': string
  'payment.insufficientBalance': string
  'payment.getMorePeaq': string
  'payment.checkBalance': string
  'payment.networkError': string
  'payment.retryConnection': string
  'payment.gasFeeError': string
  'payment.retryPayment': string
  'payment.transactionFailed': string
  'payment.unexpectedError': string
  
  // User Balance
  'userBalance.available': string
  
  // Common
  'common.balance': string
  'common.loading': string
  'common.error': string
  'common.retry': string
  'common.cancel': string
  'common.confirm': string
  'common.close': string
  'common.copy': string
  'common.copied': string
  'common.tryAgain': string
  
  // Units
  'units.peaq': string
  'units.pft': string
  'units.usd': string
  'units.bps': string
}

// English translations
const enTranslations: Translations = {
  // Header
  'header.wallet': 'Wallet',
  'header.logout': 'Logout',
  'header.copyAddress': 'Copy Address',
  'header.copied': 'Copied!',
  'header.copyFailed': 'Copy Failed',
  'header.noWalletAddress': 'No wallet address available',
  
  // Splash
  'splash.title': 'Machine Economy',
  'splash.description': 'Own, operate, and earn from\nautonomous machines',
  
  // Onboarding
  'onboarding.welcome': 'Welcome to peaq',
  'onboarding.subtitle': 'Connect your wallet to start earning from\nautonomous machines',
  'onboarding.getStarted': 'Get Started',
  'onboarding.connecting': 'Connecting...',
  'onboarding.loginFailed': 'Login Failed',
  'onboarding.tryAgain': 'Please try again',
  'onboarding.openingLogin': 'Opening login options...',
  
  // Navigation
  'nav.dashboard': 'Dashboard',
  'nav.machineSelection': 'Machine Selection',
  'nav.machines': 'Machines',
  'nav.backToMachines': 'Back to Machines',
  
  // Dashboard
  'dashboard.title': 'Dashboard',
  'dashboard.totalPftEarnings': 'Total PFT Earnings',
  'dashboard.networkRevenue': 'Network Revenue',
  'dashboard.userPftEarnings': 'Your PFT Earnings',
  'dashboard.noMachines': 'No machines found',
  'dashboard.loading': 'Loading...',
  'dashboard.subtitle': 'Your PFT earnings and network overview',
  'dashboard.pftEarningsPerMachine': 'PFT Earnings Per Machine',
  'dashboard.earningsBreakdown': 'Your earnings breakdown by machine',
  'dashboard.twitterUser': 'Twitter User',
  'dashboard.peaqUser': 'PEAQ User',
  
  // Machine Selection
  'machines.title': 'Machine Selection',
  'machines.totalNetworkRevenue': 'Total Network Revenue',
  'machines.activeMachines': 'Active Machines',
  'machines.profitSharingToken': 'Profit Sharing Token',
  'machines.availableForPurchase': 'Available for Purchase',
  'machines.selectMachine': 'Select Machine',
  'machines.price': 'Price',
  'machines.type': 'Type',
  'machines.address': 'Address',
  'machines.active': 'ACTIVE',
  'machines.inactive': 'INACTIVE',
  'machines.hotSale': 'HOT SALE',
  'machines.coffeeCost': 'Cost to order one coffee',
  'machines.interactionCost': 'Cost per interaction or rental slot',
  'machines.online': 'Online',
  'machines.availableMachines': 'Available Machines',
  'machines.selectToEarn': 'Select a machine to interact with and earn',
  
  // Ownership
  'ownership.title': 'Ownership Confirmed',
  'ownership.congratulations': 'Congratulations!',
  'ownership.successMessage': 'You have successfully purchased your machine and are now earning profit sharing tokens!',
  'ownership.profitSharingToken': 'Profit Sharing Token',
  'ownership.pricePaid': 'Price Paid',
  'ownership.platformFee': 'Platform Fee',
  'ownership.backToMachines': 'Back to Machines',
  'ownership.machine': 'Machine',
  'ownership.transactionComplete': 'Transaction Complete',
  
  // Payment
  'payment.title': 'Payment Processing',
  'payment.processing': 'Processing...',
  'payment.success': 'Payment Successful',
  'payment.error': 'Payment Error',
  'payment.goBack': 'Go Back',
  'payment.transactionHash': 'Transaction Hash',
  'payment.viewOnExplorer': 'View on Explorer',
  'payment.airdropTransaction': 'Airdrop Transaction',
  'payment.machineTransaction': 'Machine Usage Transaction',
  'payment.airdropping': 'Airdropping peaq tokens...',
  'payment.getting': 'Getting',
  'payment.gasFee': 'gas fee',
  'payment.usingMachine': 'Using machine...',
  'payment.callingContract': 'Calling useMachine contract function',
  'payment.gotYour': 'You got your',
  'payment.completedSuccessfully': 'Transaction completed successfully',
  'payment.checkingEligibility': 'Checking airdrop eligibility...',
  'payment.viewOwnership': 'View Ownership Details',
  'payment.transactionInProgress': 'Transaction in Progress',
  'payment.viewTransactions': 'View Transactions',
  'payment.cancelled': 'Transaction Cancelled',
  'payment.cancelledMessage': 'You cancelled the transaction. No charges have been made.',
  'payment.tryAgain': 'Try Again',
  'payment.walletRequired': 'Please connect your wallet to continue with the payment.',
  'payment.connectWallet': 'Connect Wallet',
  'payment.insufficientBalance': 'Your wallet doesn\'t have enough peaq tokens for this transaction.',
  'payment.getMorePeaq': 'Get More peaq',
  'payment.checkBalance': 'Check Balance',
  'payment.networkError': 'Unable to connect to the peaq network. Please check your internet connection and try again.',
  'payment.retryConnection': 'Retry Connection',
  'payment.gasFeeError': 'There was an issue with the gas fee estimation. Please try again or adjust your gas settings.',
  'payment.retryPayment': 'Retry Payment',
  'payment.transactionFailed': 'The blockchain transaction failed. Your funds are safe and no charges were made.',
  'payment.unexpectedError': 'An unexpected error occurred. Please try again.',
  
  // User Balance
  'userBalance.available': 'Available for machine interactions',
  
  // Common
  'common.balance': 'Balance',
  'common.loading': 'Loading...',
  'common.error': 'Error',
  'common.retry': 'Retry',
  'common.cancel': 'Cancel',
  'common.confirm': 'Confirm',
  'common.close': 'Close',
  'common.copy': 'Copy',
  'common.copied': 'Copied',
  'common.tryAgain': 'Please try again',
  
  // Units
  'units.peaq': 'PEAQ',
  'units.pft': 'PFT',
  'units.usd': 'USD',
  'units.bps': 'bps',
}

// Korean translations
const koTranslations: Translations = {
  // Header
  'header.wallet': '지갑',
  'header.logout': '로그아웃',
  'header.copyAddress': '주소 복사',
  'header.copied': '복사됨!',
  'header.copyFailed': '복사 실패',
  'header.noWalletAddress': '사용 가능한 지갑 주소가 없습니다',
  
  // Splash
  'splash.title': '머신 이코노미',
  'splash.description': '자율 머신을 소유하고 운영하며\n수익을 얻으세요',
  
  // Onboarding
  'onboarding.welcome': 'peaq에 오신 것을 환영합니다',
  'onboarding.subtitle': '지갑을 연결하여 자율 머신에서\n수익을 얻기 시작하세요',
  'onboarding.getStarted': '시작하기',
  'onboarding.connecting': '연결 중...',
  'onboarding.loginFailed': '로그인 실패',
  'onboarding.tryAgain': '다시 시도해주세요',
  'onboarding.openingLogin': '로그인 옵션을 여는 중...',
  
  // Navigation
  'nav.dashboard': '대시보드',
  'nav.machineSelection': '머신 선택',
  'nav.machines': '머신',
  'nav.backToMachines': '머신으로 돌아가기',
  
  // Dashboard
  'dashboard.title': '대시보드',
  'dashboard.totalPftEarnings': '총 PFT 수익',
  'dashboard.networkRevenue': '네트워크 수익',
  'dashboard.userPftEarnings': '내 PFT 수익',
  'dashboard.noMachines': '머신을 찾을 수 없습니다',
  'dashboard.loading': '로딩 중...',
  'dashboard.subtitle': '내 PFT 수익 및 네트워크 개요',
  'dashboard.pftEarningsPerMachine': '머신별 PFT 수익',
  'dashboard.earningsBreakdown': '머신별 수익 분석',
  'dashboard.twitterUser': '트위터 사용자',
  'dashboard.peaqUser': 'PEAQ 사용자',
  
  // Machine Selection
  'machines.title': '머신 선택',
  'machines.totalNetworkRevenue': '총 네트워크 수익',
  'machines.activeMachines': '활성 머신',
  'machines.profitSharingToken': '수익 공유 토큰',
  'machines.availableForPurchase': '구매 가능',
  'machines.selectMachine': '머신 선택',
  'machines.price': '가격',
  'machines.type': '유형',
  'machines.address': '주소',
  'machines.active': '활성',
  'machines.inactive': '비활성',
  'machines.hotSale': '인기 상품',
  'machines.coffeeCost': '커피 한 잔 주문 비용',
  'machines.interactionCost': '상호작용 또는 대여 슬롯당 비용',
  'machines.online': '온라인',
  'machines.availableMachines': '사용 가능한 머신',
  'machines.selectToEarn': '상호작용하고 수익을 얻을 머신을 선택하세요',
  
  // Ownership
  'ownership.title': '소유권 확인됨',
  'ownership.congratulations': '축하합니다!',
  'ownership.successMessage': '머신을 성공적으로 구매했으며 이제 수익 공유 토큰을 얻고 있습니다!',
  'ownership.profitSharingToken': '수익 공유 토큰',
  'ownership.pricePaid': '지불한 가격',
  'ownership.platformFee': '플랫폼 수수료',
  'ownership.backToMachines': '머신으로 돌아가기',
  'ownership.machine': '머신',
  'ownership.transactionComplete': '거래 완료',
  
  // Payment
  'payment.title': '결제 처리',
  'payment.processing': '처리 중...',
  'payment.success': '결제 성공',
  'payment.error': '결제 오류',
  'payment.goBack': '돌아가기',
  'payment.transactionHash': '거래 해시',
  'payment.viewOnExplorer': '익스플로러에서 보기',
  'payment.airdropTransaction': '에어드롭 거래',
  'payment.machineTransaction': '머신 사용 거래',
  'payment.airdropping': 'peaq 토큰 에어드롭 중...',
  'payment.getting': '받는 중',
  'payment.gasFee': '가스 수수료',
  'payment.usingMachine': '머신 사용 중...',
  'payment.callingContract': 'useMachine 컨트랙트 함수 호출 중',
  'payment.gotYour': '받았습니다',
  'payment.completedSuccessfully': '거래가 성공적으로 완료되었습니다',
  'payment.checkingEligibility': '에어드롭 자격 확인 중...',
  'payment.viewOwnership': '소유권 세부정보 보기',
  'payment.transactionInProgress': '거래 진행 중',
  'payment.viewTransactions': '거래 보기',
  'payment.cancelled': '거래 취소됨',
  'payment.cancelledMessage': '거래를 취소했습니다. 요금이 부과되지 않았습니다.',
  'payment.tryAgain': '다시 시도',
  'payment.walletRequired': '결제를 계속하려면 지갑을 연결해주세요.',
  'payment.connectWallet': '지갑 연결',
  'payment.insufficientBalance': '이 거래에 필요한 peaq 토큰이 부족합니다.',
  'payment.getMorePeaq': 'peaq 더 받기',
  'payment.checkBalance': '잔액 확인',
  'payment.networkError': 'peaq 네트워크에 연결할 수 없습니다. 인터넷 연결을 확인하고 다시 시도해주세요.',
  'payment.retryConnection': '연결 재시도',
  'payment.gasFeeError': '가스 수수료 추정에 문제가 있었습니다. 다시 시도하거나 가스 설정을 조정해주세요.',
  'payment.retryPayment': '결제 재시도',
  'payment.transactionFailed': '블록체인 거래가 실패했습니다. 자금은 안전하며 요금이 부과되지 않았습니다.',
  'payment.unexpectedError': '예상치 못한 오류가 발생했습니다. 다시 시도해주세요.',
  
  // User Balance
  'userBalance.available': '머신 상호작용에 사용 가능',
  
  // Common
  'common.balance': '잔액',
  'common.loading': '로딩 중...',
  'common.error': '오류',
  'common.retry': '다시 시도',
  'common.cancel': '취소',
  'common.confirm': '확인',
  'common.close': '닫기',
  'common.copy': '복사',
  'common.copied': '복사됨',
  'common.tryAgain': '다시 시도해주세요',
  
  // Units
  'units.peaq': 'PEAQ',
  'units.pft': 'PFT',
  'units.usd': 'USD',
  'units.bps': 'bps',
}

// Translation map
const translations: Record<Language, Translations> = {
  en: enTranslations,
  ko: koTranslations,
}

// Language context type
interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: keyof Translations) => string
  isKorean: boolean
  isEnglish: boolean
}

// Create context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Language provider props
interface LanguageProviderProps {
  children: ReactNode
}

// Language provider component
export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>('en') // Default to English

  const setLanguage = useCallback((newLanguage: Language) => {
    console.log('Language changed to:', newLanguage)
    setLanguageState(newLanguage)
    // Save to localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('peaq-language', newLanguage)
    }
  }, [language])

  // Load saved language on mount
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('peaq-language') as Language
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ko')) {
        setLanguageState(savedLanguage)
      }
    }
  }, [])

  const t = useCallback((key: keyof Translations): string => {
    const translation = translations[language][key] || key
    return translation
  }, [language])

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    isKorean: language === 'ko',
    isEnglish: language === 'en',
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

// Hook to use language context
export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

// Export language options for UI
export const languageOptions = [
  { code: 'en' as Language, name: 'English', flag: '🇺🇸' },
  { code: 'ko' as Language, name: '한국어', flag: '🇰🇷' },
]
