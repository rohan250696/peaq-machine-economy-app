import React from 'react'
import { Platform } from 'react-native'
import NewHeader from './NewHeader'
import UserInfoHeader from './UserInfoHeader'

export default function FixedHeader() {
  if (Platform.OS === 'web') {
    return <NewHeader />
  }

  // Mobile version - keep existing UserInfoHeader for now
  return <UserInfoHeader />
}