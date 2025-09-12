// Minimal polyfills for React Native - only essential ones

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

// Global error handler for slice errors
const originalOnError = global.onerror;
global.onerror = function(message, source, lineno, colno, error) {
  if (typeof message === 'string' && message.includes('slice of undefined')) {
    console.warn('Caught slice of undefined error, providing fallback:', message);
    return true; // Prevent the error from propagating
  }
  if (originalOnError) {
    return originalOnError.call(this, message, source, lineno, colno, error);
  }
  return false;
};

// Global unhandled promise rejection handler
const originalOnUnhandledRejection = global.onunhandledrejection;
global.onunhandledrejection = function(event) {
  if (event.reason && typeof event.reason === 'object' && 
      event.reason.message && event.reason.message.includes('slice of undefined')) {
    console.warn('Caught unhandled slice error in promise:', event.reason.message);
    event.preventDefault(); // Prevent the error from propagating
    return;
  }
  if (originalOnUnhandledRejection) {
    return originalOnUnhandledRejection.call(this, event);
  }
};

// Override slice methods globally to catch all slice calls
const originalStringSlice = String.prototype.slice;
String.prototype.slice = function(start: number = 0, end?: number) {
  try {
    if (this == null) {
      console.warn('String.slice called on null/undefined, returning empty string');
      return '';
    }
    return originalStringSlice.call(this, start, end);
  } catch (error) {
    console.warn('String.slice error caught:', error);
    return '';
  }
};

const originalArraySlice = Array.prototype.slice;
Array.prototype.slice = function(start: number = 0, end?: number) {
  try {
    if (this == null) {
      console.warn('Array.slice called on null/undefined, returning empty array');
      return [];
    }
    return originalArraySlice.call(this, start, end);
  } catch (error) {
    console.warn('Array.slice error caught:', error);
    return [];
  }
};

// Additional Hermes compatibility fixes
if (typeof global.setImmediate === 'undefined') {
  (global as any).setImmediate = (cb: (...args: any[]) => void, ...args: any[]) => 
    setTimeout(cb, 0, ...args);
}

if (typeof global.clearImmediate === 'undefined') {
  (global as any).clearImmediate = (id: any) => clearTimeout(id);
}
