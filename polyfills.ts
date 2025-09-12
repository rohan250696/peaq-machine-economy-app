// Polyfills for React Native - must be imported first
// Check if we're in React Native environment
const isReactNative = typeof navigator !== 'undefined' && navigator.product === 'ReactNative';

// Only import React Native specific modules in React Native environment
if (isReactNative) {
  try {
    require('react-native-quick-crypto'); // Native crypto implementation
    require('react-native-get-random-values');
    require('fast-text-encoding');
    require('react-native-url-polyfill/auto');
  } catch (error) {
    console.log('Some React Native polyfills failed to load:', error);
  }
}

import { Buffer } from 'buffer';
import processPolyfill from 'process';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Additional polyfills for Hermes compatibility
// import 'text-encoding'; // Removed - not needed

// Set up global polyfills
if (typeof (global as any).Buffer === 'undefined') {
  (global as any).Buffer = Buffer;
}
if (typeof (global as any).process === 'undefined') {
  (global as any).process = processPolyfill;
}
if (typeof (global as any).AsyncStorage === 'undefined') {
  (global as any).AsyncStorage = AsyncStorage;
}

// Additional global setup for crypto (only in React Native)
if (isReactNative && typeof (global as any).crypto === 'undefined') {
  try {
    // Try to use react-native-quick-crypto first
    (global as any).crypto = require('react-native-quick-crypto');
  } catch (error) {
    // Fallback to react-native-get-random-values
    console.log('Using fallback crypto polyfill');
    (global as any).crypto = require('react-native-get-random-values');
  }
}

// Ensure globalThis is available
if (typeof (global as any).globalThis === 'undefined') {
  (global as any).globalThis = global;
}

// Ensure window is available for web compatibility
if (typeof (global as any).window === 'undefined') {
  (global as any).window = global;
}

// Simple error logging for debugging
const originalError = console.error;
console.error = (...args) => {
  if (args[0] && typeof args[0] === 'string' && args[0].includes('slice')) {
    console.log('🚨 SLICE ERROR DETECTED:', ...args);
  }
  originalError.apply(console, args);
};

// Only add slice polyfills if they don't exist (for Hermes compatibility)
if (typeof String.prototype.slice === 'undefined') {
  String.prototype.slice = function(start: number = 0, end?: number) {
    if (this == null) {
      return '';
    }
    return this.substring(start, end);
  };
}

if (typeof Array.prototype.slice === 'undefined') {
  Array.prototype.slice = function(start: number = 0, end?: number) {
    if (this == null) {
      return [];
    }
    const length = this.length;
    const startIndex = start < 0 ? Math.max(length + start, 0) : Math.min(start, length);
    const endIndex = end === undefined ? length : (end < 0 ? Math.max(length + end, 0) : Math.min(end, length));
    const result = [];
    for (let i = startIndex; i < endIndex; i++) {
      result.push(this[i]);
    }
    return result;
  };
}

// Additional Hermes compatibility fixes
if (typeof global.setImmediate === 'undefined') {
  (global as any).setImmediate = (cb: (...args: any[]) => void, ...args: any[]) => 
    setTimeout(cb, 0, ...args);
}

if (typeof global.clearImmediate === 'undefined') {
  (global as any).clearImmediate = (id: any) => clearTimeout(id);
}
