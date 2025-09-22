import React from 'react'
import { TouchableOpacity, StyleSheet } from 'react-native'
import { SvgXml } from 'react-native-svg'
import { useTheme } from '../contexts/ThemeContext'
import { responsive, spacing } from '../utils/responsive'

const menuIconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M3 12H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M3 6H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

interface SidebarToggleProps {
  onToggle: () => void
  size?: number
}

export default function SidebarToggle({ onToggle, size = 24 }: SidebarToggleProps) {
  const { colors } = useTheme()

  const dynamicStyles = {
    button: {
      backgroundColor: colors.card,
      borderColor: colors.border,
    }
  }

  return (
    <TouchableOpacity
      style={[styles.button, dynamicStyles.button]}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <SvgXml 
        xml={menuIconSvg} 
        width={responsive(size - 4, size, size + 4)} 
        height={responsive(size - 4, size, size + 4)}
        color={colors.peaqPurple}
      />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    padding: responsive(spacing.sm, spacing.md, spacing.lg),
    borderRadius: responsive(8, 10, 12),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
})
