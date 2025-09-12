import React, { ReactNode } from 'react';
import { Platform } from 'react-native';

// Platform-specific imports
import WebProviders from '../../providers/WebProviders';
import ExpoProviders from '../../providers/ExpoProviders';

interface PlatformProvidersProps {
  children: ReactNode;
}

export default function PlatformProviders({ children }: PlatformProvidersProps) {
  // console.log('Platform.OS', Platform, children);
  // if (Platform.OS === 'web') {
    
  // } else {
  //   return <ExpoProviders>{children}</ExpoProviders>;
  // }
  return <WebProviders>{children}</WebProviders>;
}
