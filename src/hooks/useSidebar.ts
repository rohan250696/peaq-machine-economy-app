import { useState, useCallback } from 'react'

export function useSidebar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = useCallback(() => {
    console.log('useSidebar: toggleSidebar called, current state:', isSidebarOpen)
    setIsSidebarOpen(prev => {
      const newState = !prev
      console.log('useSidebar: setting sidebar to:', newState)
      return newState
    })
  }, [isSidebarOpen])

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false)
  }, [])

  const openSidebar = useCallback(() => {
    setIsSidebarOpen(true)
  }, [])

  return {
    isSidebarOpen,
    toggleSidebar,
    closeSidebar,
    openSidebar,
    setIsSidebarOpen
  }
}
