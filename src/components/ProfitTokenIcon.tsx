import React from 'react'
import { View, StyleSheet } from 'react-native'
import Svg, { Circle, Path, G, Defs, LinearGradient, Stop } from 'react-native-svg'
import { useTheme } from '../contexts/ThemeContext'

interface ProfitTokenIconProps {
  size?: number
  color?: string
}

export default function ProfitTokenIcon({ size = 24, color }: ProfitTokenIconProps) {
  const { colors } = useTheme()
  const iconColor = color || colors.primary

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Defs>
          <LinearGradient id="profitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={iconColor} stopOpacity="0.8" />
            <Stop offset="100%" stopColor={iconColor} stopOpacity="1" />
          </LinearGradient>
        </Defs>
        
        {/* Outer circle with gradient */}
        <Circle
          cx="12"
          cy="12"
          r="11"
          fill="url(#profitGradient)"
          stroke={iconColor}
          strokeWidth="0.5"
        />
        
        {/* Dollar sign */}
        <G transform="translate(12, 12)">
          <Path
            d="M-2.5,6 L2.5,6 M-2.5,-6 L2.5,-6 M-2.5,6 C-2.5,3 -1,1.5 1,1.5 C3,1.5 4.5,3 4.5,6 C4.5,9 3,10.5 1,10.5 C-1,10.5 -2.5,9 -2.5,6 Z"
            stroke="white"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          
          {/* Vertical line */}
          <Path
            d="M0,-8 L0,8"
            stroke="white"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </G>
        
        {/* Small decorative dots */}
        <Circle cx="6" cy="6" r="1" fill="white" opacity="0.6" />
        <Circle cx="18" cy="6" r="1" fill="white" opacity="0.6" />
        <Circle cx="6" cy="18" r="1" fill="white" opacity="0.6" />
        <Circle cx="18" cy="18" r="1" fill="white" opacity="0.6" />
      </Svg>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
})
