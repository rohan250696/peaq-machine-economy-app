import { Machine } from '../types'

// Mock data for machines
export const MOCK_MACHINES: Machine[] = [
  {
    id: 'robo-cafe-001',
    name: 'RoboCafe',
    type: 'RoboCafe',
    image: 'coffee-robo-image.png',
    address: '',
    revenue: 0.00,
    totalRevenue: 0,
    isActive: true,
    location: {
      name: 'Main Exhibition',
      lat: 52.5200,
      lng: 13.4050,
    },
  },
  {
    id: 'humanoid-001',
    name: 'Humanoid Dispenser',
    type: 'Humanoid',
    image: 'humanoid.png',
    address: '',
    revenue: 0,
    totalRevenue: 0,
    isActive: true,
    location: {
      name: 'Conference Hall A',
      lat: 52.5200,
      lng: 13.4050,
    },
  },
]

// Animation durations
export const ANIMATION_DURATION = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 800,
}

// Enhanced glassmorphism styles with peaq colors
export const GLASSMORPHISM = {
  background: 'rgba(82, 82, 215, 0.08)', // purple-600 with lower opacity for subtlety
  border: 'rgba(82, 82, 215, 0.15)',
  backdropFilter: 'blur(20px)',
  shadow: {
    shadowColor: '#5252D7', // purple-600 for colored shadow
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  // Enhanced variants for different use cases
  card: {
    background: 'rgba(82, 82, 215, 0.06)',
    border: 'rgba(82, 82, 215, 0.12)',
    shadow: {
      shadowColor: '#5252D7',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 10,
    },
  },
  button: {
    background: 'rgba(82, 82, 215, 0.1)',
    border: 'rgba(82, 82, 215, 0.2)',
    shadow: {
      shadowColor: '#5252D7',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
  },
}

// Peaq gradient colors
export const GRADIENTS = {
  primary: ['#5252D7', '#8484FE'], // purple-600 to text-color-400
  secondary: ['#CC940A', '#FF5F52'], // alert-text to red-scale-FF5F52
  success: ['#06B6D4', '#A5F3FC'], // cyan-500 to cyan-100
  machine: ['#5252D7', '#6666FE', '#8484FE'], // Machine card gradient with peaq purples
}

// Machine actions
export const MACHINE_ACTIONS = {
  RoboCafe: {
    emoji: '☕',
    action: 'Get Coffee',
    price: 0.1,
    description: 'Freshly brewed coffee from our robotic barista',
  },
  Humanoid: {
    emoji: '👕',
    action: 'Get T-Shirt',
    price: 0.25,
    description: 'Custom printed t-shirt from our humanoid factory',
  },
}

export const AGUNG_TESTNET_MACHINE_MANAGER_ADDRESS = 
'0x6777c79cB7ADeFC8021992A5268c204C5493B70c';
export const PEAQ_MACHINE_MANAGER_ADDRESS = 
'';

export const TOKEN_ADDRESS = '0x0000000000000000000000000000000000000809';

export const AGUNG_PROFIT_SHARING_TOKEN_ADDRESS = '0x933a7adEE8C034aD3221b5758038424f7344EC15';
export const PEAQ_PROFIT_SHARING_TOKEN_ADDRESS = '';
export const KWB_APP_WALLET_KEY = "3d98d7d168ed6c4c1eaec1722b2b5a56dfb8caa0b01b622c0ac345fd7ba4ef32"
