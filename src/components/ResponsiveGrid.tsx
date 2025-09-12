import React from 'react'
import { View, StyleSheet, ScrollView, Dimensions, Platform } from 'react-native'
import { 
  spacing, 
  responsive, 
  getGridColumns, 
  isMobile, 
  isTablet, 
  isDesktop,
  safeAreaPadding
} from './ResponsiveLayout'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

interface ResponsiveGridProps {
  children: React.ReactNode
  columns?: number
  gap?: number
  padding?: number
  scrollable?: boolean
  style?: any
  contentContainerStyle?: any
  showsVerticalScrollIndicator?: boolean
  onScroll?: (event: any) => void
  scrollEventThrottle?: number
}

export default function ResponsiveGrid({
  children,
  columns,
  gap = spacing.md,
  padding = safeAreaPadding.horizontal,
  scrollable = true,
  style,
  contentContainerStyle,
  showsVerticalScrollIndicator = false,
  onScroll,
  scrollEventThrottle = 16,
}: ResponsiveGridProps) {
  const gridColumns = columns || getGridColumns()
  const isGrid = gridColumns > 1

  const gridStyle = [
    styles.grid,
    {
      flexDirection: isGrid ? 'row' : 'column',
      flexWrap: isGrid ? 'wrap' : 'nowrap',
      gap,
      padding,
    },
    style
  ]

  const contentStyle = [
    styles.content,
    contentContainerStyle
  ]

  if (!scrollable) {
    return (
      <View style={gridStyle}>
        {children}
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={contentStyle}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      bounces={true}
      alwaysBounceVertical={false}
      scrollEventThrottle={scrollEventThrottle}
      onScroll={onScroll}
      nestedScrollEnabled={false}
      keyboardShouldPersistTaps="handled"
      removeClippedSubviews={false}
      scrollEnabled={true}
      directionalLockEnabled={true}
      // Web-specific props
      {...(Platform.OS === 'web' && {
        style: styles.scrollView,
      })}
    >
      <View style={gridStyle}>
        {children}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    height: '100%',
  },
  content: {
    flexGrow: 1,
    paddingBottom: safeAreaPadding.bottom + spacing.xl,
    minHeight: '100%',
  },
  grid: {
    flex: 1,
    minHeight: '100%',
  },
})

// Helper component for grid items
interface GridItemProps {
  children: React.ReactNode
  columns?: number
  style?: any
}

export function GridItem({ children, columns, style }: GridItemProps) {
  const gridColumns = columns || getGridColumns()
  const isGrid = gridColumns > 1
  
  const itemStyle = [
    itemStyles.item,
    isGrid && {
      width: `${100 / gridColumns}%`,
    },
    style
  ]

  return (
    <View style={itemStyle}>
      {children}
    </View>
  )
}

const itemStyles = StyleSheet.create({
  item: {
    // Base item styles
  },
})

// Responsive container component
interface ResponsiveContainerProps {
  children: React.ReactNode
  maxWidth?: number
  center?: boolean
  style?: any
}

export function ResponsiveContainer({ 
  children, 
  maxWidth, 
  center = true, 
  style 
}: ResponsiveContainerProps) {
  const containerStyle = [
    containerStyles.container,
    center && containerStyles.centered,
    maxWidth && { maxWidth },
    style
  ]

  return (
    <View style={containerStyle}>
      {children}
    </View>
  )
}

const containerStyles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  centered: {
    alignSelf: 'center',
    width: responsive('100%', '90%', '80%'),
    maxWidth: responsive(400, 600, 800),
  },
})
